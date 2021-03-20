import { Listenable } from './Listenable.js'
import {
  toControlPoints,
  toReversedControlPoints,
  createToAnimationProgress,
  toInterpolated,
  isFunction,
} from '../util.js'

function byProgress ({ progress: progressA }, { progress: progressB }) {
  return progressA - progressB
}

/**
 * @type {AnimateableOptions}
 */
const defaultOptions = {
        duration: 0,
        // delay can be handled by delayable
        timing: [
          0, 0,
          1, 1,
        ], // linear by default
        iterations: 1,
        alternates: false,
      }

export class Animateable {
  /**
   * @typedef {{ progress: number, data: { [key: string]: (number | string | any[]) } }} AnimateableKeyframe
   * @typedef {{ duration?: number, timing?: [number, number, number, number], iterations?: number, alternates?: boolean }} AnimateableOptions
   * @param {AnimateableKeyframe[]} keyframes
   * @param {AnimateableOptions} [options]
   */
  constructor (keyframes, options = {}) {
    this._initialDuration = options?.duration || defaultOptions.duration
    this._controlPoints = toControlPoints(options?.timing || defaultOptions.timing)
    this._iterationLimit = options?.iterations || defaultOptions.iterations
    this._alternates = options?.alternates || defaultOptions.alternates

    this._reversedControlPoints = toReversedControlPoints(this._controlPoints)
    
    this._toAnimationProgress = createToAnimationProgress(this._controlPoints)
    this._reversedToAnimationProgress = createToAnimationProgress(this._reversedControlPoints)

    this._playCache = {}
    this._reverseCache = {}
    this._pauseCache = {}
    this._seekCache = {}
    this._alternateCache = { status: 'ready' }
    this._visibilitychange = new Listenable('visibilitychange')
    
    this.setKeyframes(keyframes)
    this.setPlaybackRate(1)
    this._ready()
    this._resetTime()
    this._resetProgress()
    this._resetIterations()
  }
  _ready () {
    this._computedStatus = 'ready'
  }
  _resetTime () {
    this._computedTime = {
      elapsed: 0,
      remaining: this._duration,
    }
  }
  _resetProgress () {
    this._computedProgress = {
      time: 0,
      animation: 0,
    }
  }
  _resetIterations () {
    this._computedIterations = 0
  }

  get keyframes () {
    return this._computedKeyframes
  }
  set keyframes (keyframes) {
    this.setKeyframes(keyframes)
  }
  get playbackRate () {
    return this._computedPlaybackRate
  }
  set playbackRate (playbackRate) {
    this.setPlaybackRate(playbackRate)
  }
  get status () {
    return this._computedStatus
  }
  get iterations () {
    return this._computedIterations
  }
  get request () {
    return this._computedRequest
  }
  get time () {
    return this._computedTime
  }
  get progress () {
    return this._computedProgress
  }

  /**
   * @param {AnimateableKeyframe[]} keyframes 
   */
  setKeyframes (keyframes) {
    this.stop()

    this._computedKeyframes = Array.from(keyframes).sort(byProgress) // Sort without mutating original

    this._reversedKeyframes = Array.from(this.keyframes).reverse() // Reverse without mutating
      .map(({ progress, data }) => ({ progress: 1 - progress, data }))

    this._properties = this._getProperties()
    this._easeables = this._getEaseables()
    this._reversedEaseables = this._getReversedEaseables()

    return this
  }
  _getProperties () {
    return Array.from(
      new Set(
        this.keyframes.map(({ data }) => Object.keys(data)).flat()
      )
    )
  }
  _getEaseables () {
    return this._properties.reduce((easeables, property) => {
      const propertyKeyframes = this.keyframes.filter(({ data }) => data.hasOwnProperty(property)),
            propertyEaseables = propertyKeyframes.reduce((propertyEaseables, keyframe, index, array) => {
              const previous = keyframe.data[property],
                    next = index === array.length - 1 ? previous : array[index + 1].data[property],
                    start = keyframe.progress,
                    end = index === array.length - 1 ? 2 : array[index + 1].progress,
                    hasCustomTiming = !!keyframe?.timing,
                    toAnimationProgress = index === array.length - 1
                      ? timeProgress => 1
                      : createToAnimationProgress((hasCustomTiming && toControlPoints(keyframe.timing)) || this._controlPoints)

              return [
                ...propertyEaseables,
                {
                  property,
                  value: { previous, next },
                  progress: { start, end },
                  hasCustomTiming,
                  toAnimationProgress
                }
              ]
            }, []),
            firstEaseable = {
              property,
              value: { previous: propertyEaseables[0].value.previous, next: propertyEaseables[0].value.previous },
              progress: { start: -1, end: propertyEaseables[0].progress.start },
              toAnimationProgress: timeProgress => 1,
            }
      
      return [
        ...easeables,
        firstEaseable,
        ...propertyEaseables,
      ]
    }, [])
  }
  _getReversedEaseables () {
    // TODO: abstract and make DRYer
    return this._properties.reduce((easeables, property) => {
      const propertyKeyframes = this._reversedKeyframes.filter(({ data }) => data.hasOwnProperty(property)),
            propertyEaseables = propertyKeyframes.reduce((propertyEaseables, keyframe, index, array) => {
              const previous = keyframe.data[property],
                    next = index === array.length - 1 ? previous : array[index + 1].data[property],
                    start = keyframe.progress,
                    end = index === array.length - 1 ? 2 : array[index + 1].progress,
                    hasCustomTiming = !!keyframe?.timing,
                    toAnimationProgress = index === array.length - 1
                      ? timeProgress => 1
                      : createToAnimationProgress((hasCustomTiming && toReversedControlPoints(toControlPoints(array[index + 1].timing))) || this._reversedControlPoints)

              return [
                ...propertyEaseables,
                {
                  property,
                  value: { previous, next },
                  progress: { start, end },
                  hasCustomTiming,
                  toAnimationProgress
                }
              ]
            }, []),
            firstEaseable = {
              property,
              value: { previous: propertyEaseables[0].value.previous, next: propertyEaseables[0].value.previous },
              progress: { start: -1, end: propertyEaseables[0].progress.start },
              toAnimationProgress: timeProgress => 1,
            }
      
      return [
        ...easeables,
        firstEaseable,
        ...propertyEaseables,
      ]
    }, [])
  }

  /**
   * @param {number} playbackRate 
   */
  setPlaybackRate (playbackRate) {
    const ensuredPlaybackRate = Math.max(0, playbackRate) // negative playback rate is not supported
    this._computedPlaybackRate = ensuredPlaybackRate
    this._duration = (1 / ensuredPlaybackRate) * this._initialDuration

    switch (this.status) {
    case 'playing':
    case 'reversing': 
      this._totalTimeInvisible = (1 / ensuredPlaybackRate) * this._totalTimeInvisible
      this.seek(this.progress.time)
      
      break
    }

    return this
  }

  play (callback, options) { // Play from current time progress
    this._playCache = {
      callback,
      options,
    }

    this._listenForVisibilitychange()

    if (this._alternates) {
      switch (this._alternateCache.status) {
      case 'ready':
        this._alternateCache.status = 'playing'
        break
      }
    }

    if (this.iterations === this._iterationLimit) {
      this._computedIterations = 0
    }

    switch (this.status) {
      case 'ready':
      case 'stopped':
      case 'played':
      case 'reversed':
      case 'sought':
        this._animate(callback, options, 'play')
        break
      case 'paused':
        if (this._alternates) {
          switch (this._alternateCache.status) {
          case 'playing':
            switch (this._pauseCache.status) {
            case 'playing':
              this._animate(callback, options, 'play')
              break
            case 'reversing':
              this._animate(callback, options, 'reverse')
              break
            }
            break
          case 'reversing':
            this._alternateCache.status = 'playing'
            switch (this._pauseCache.status) {
            case 'playing':
              this._animate(callback, options, 'play')
              break
            case 'reversing':
              this._animate(callback, options, 'play')
              break
            }
            break
          }
        } else {
          this._animate(callback, options, 'play')
        }
        break
      case 'reversing':
        this.pause()
        this._animate(callback, options, 'play')
        break
    }
    
    return this
  }
  _playing () {
    this._computedStatus = 'playing'
  }
  _played () {
    this._computedStatus = 'played'
  }

  reverse (callback, options) { // Reverse from current time progress
    this._reverseCache = {
      callback,
      options,
    }

    this._listenForVisibilitychange()

    if (this._alternates) {
      switch (this._alternateCache.status) {
      case 'ready':
        this._alternateCache.status = 'reversing'
        break
      }
    }

    if (this.iterations === this._iterationLimit) {
      this._computedIterations = 0
    }

    switch (this.status) {
      case 'ready':
      case 'stopped':
      case 'played':
      case 'reversed':
      case 'sought':
        this._animate(callback, options, 'reverse')
        break
      case 'paused':
        if (this._alternates) {
          switch (this._alternateCache.status) {
          case 'playing':
            this._alternateCache.status = 'reversing'
            switch (this._pauseCache.status) {
            case 'playing':
              this._animate(callback, options, 'reverse')
              break
            case 'reversing':
              this._animate(callback, options, 'reverse')
              break
            }
            break
          case 'reversing':
            switch (this._pauseCache.status) {
            case 'playing':
              this._animate(callback, options, 'play')
              break
            case 'reversing':
              this._animate(callback, options, 'reverse')
              break
            }
            break
          }
        } else {
          this._animate(callback, options, 'play')
        }
        break
      case 'playing':
        this.pause()
        this._animate(callback, options, 'reverse')
        break
      }
    
    return this
  }
  _reversing () {
    this._computedStatus = 'reversing'
  }
  _reversed () {
    this._computedStatus = 'reversed'
  }

  _listenForVisibilitychange () {
    if (this._visibilitychange.active.size === 0) {
      /**
       * @type {number}
       */
      this._totalTimeInvisible = 0

      this._visibilitychange.listen(({ timeStamp: timestamp }) => {
        switch (document.visibilityState) {
        case 'visible':
          this._totalTimeInvisible += timestamp - this._invisibleAt
          break
        default:
          this._invisibleAt = timestamp
          break
        }        
      })
    }
  }

  _animate (callback, options = {}, type) {
    const { interpolate: interpolateOptions } = options

    this._computedRequest = window.requestAnimationFrame(timestamp => {
      this._setStartTimeAndStatus(type, timestamp)

      const timeElapsed = Math.min((timestamp - this._startTime) - this._totalTimeInvisible, this._duration), // Might need to multiply visibility offset by something to get correct playback rate
            timeRemaining = this._duration - timeElapsed,
            timeProgress = timeElapsed / this._duration,
            toAnimationProgress = this._getToAnimationProgress(type),
            animationProgress = toAnimationProgress(timeProgress)

      this._computedTime = {
        elapsed: timeElapsed,
        remaining: timeRemaining,
      }

      this._computedProgress = {
        time: timeProgress,
        animation: animationProgress,
      }

      const frame = {
        ...this._getFrame(type, timeProgress, interpolateOptions),
        timestamp,
      }

      callback(frame) // TODO: error message

      this._recurse(type, timeRemaining, callback, options)
    })

    return this
  }
  _setStartTimeAndStatus (type, timestamp) {
    switch (type) {
    case 'play':
      switch (this.status) {
      case 'ready':
      case 'played':
      case 'reversed':
      case 'stopped':
        this._startTime = timestamp
        this._playing()
        break
      case 'paused':
        switch (this._pauseCache.status) {
        case 'playing':
          this._startTime = timestamp - this._duration * this._pauseCache.timeProgress
          break
        case 'reversing':
          this._startTime = timestamp - (this._duration * (1 - this._pauseCache.timeProgress))
          break
        }
        this._playing()
        break
      case 'sought':
        this._startTime = timestamp - this._duration * this._seekCache.timeProgress
        this._playing()
        break
      }
      break
    case 'reverse':
      switch (this.status) {
      case 'ready':
      case 'played':
      case 'reversed':
      case 'stopped':
        this._startTime = timestamp
        this._reversing()
        break
      case 'paused':
        switch (this._pauseCache.status) {
        case 'playing':
          this._startTime = timestamp - (this._duration * (1 - this._pauseCache.timeProgress))
          break
        case 'reversing':
          this._startTime = timestamp - this._duration * this._pauseCache.timeProgress
          break
        }
        this._reversing()
        break
      case 'sought':
        this._startTime = timestamp - this._duration * this._seekCache.timeProgress
        this._reversing()
        break
      }
      break
    case 'seek':
      this._startTime = timestamp - this._duration * this._seekCache.timeProgress
      break
    }
  }
  _getToAnimationProgress (type) {
    switch (type) {
    case 'play':
    case 'seek':
      return this._toAnimationProgress.bind(this)
    case 'reverse':
      return this._reversedToAnimationProgress.bind(this)
    }
  }
  _getFrame (type, naiveTimeProgress, interpolateOptions) {
    const easeables = (() => {
      switch (type) {
        case 'play':
        case 'seek':
          return this._easeables
        case 'reverse':
          return this._reversedEaseables
        }
    })()

    return easeables
      .filter(({ progress: { start, end } }) => start < naiveTimeProgress && end >= naiveTimeProgress)
      .reduce((frame, { property, progress, value: { previous, next }, hasCustomTiming, toAnimationProgress }) => {
        const timeProgress = (naiveTimeProgress - progress.start) / (progress.end - progress.start),
              animationProgress = toAnimationProgress(timeProgress)
        
        return {
          data: {
            ...frame.data,
            [property]: toInterpolated({ previous, next, progress: animationProgress }, interpolateOptions)
          },
          progress: {
            ...frame.progress,
            [property]: { time: timeProgress, animation: animationProgress },
          }
        }
      }, { data: {}, progress: {} })
  }
  _recurse (type, timeRemaining, callback, options) {
    switch (type) {
    case 'play':
      if (timeRemaining <= 0) {
        this._played()
        this._totalTimeInvisible = 0

        if (this._alternates) {
          switch (this._alternateCache.status) {
          case 'playing':
            this._animate(callback, options, 'reverse')
            break
          case 'reversing':
            this._computedIterations += 1

            if (this.iterations < this._iterationLimit || this._iterationLimit === true) {
              this._animate(callback, options, 'reverse')
            } else {
              this._alternateCache.status = 'ready'
            }

            break
          }
        } else {
          this._computedIterations += 1

          if (this.iterations < this._iterationLimit || this._iterationLimit === true) {
            this._animate(callback, options, 'play')
          }
        }
      } else {
        this._animate(callback, options, 'play')
      }
      break
    case 'reverse':
      if (timeRemaining <= 0) {
        this._reversed()
        this._totalTimeInvisible = 0

        if (this._alternates) {
          switch (this._alternateCache.status) {
          case 'playing':
            this._computedIterations += 1

            if (this.iterations < this._iterationLimit || this._iterationLimit === true) {
              this._animate(callback, options, 'play')
            } else {
              this._alternateCache.status = 'ready'
            }

            break
          case 'reversing':
            this._animate(callback, options, 'play')
            break
          }
        } else {
          this._computedIterations += 1

          if (this.iterations < this._iterationLimit) {
            this._animate(callback, options, 'reverse')
          }
        }
      } else {
        this._animate(callback, options, 'reverse')
      }
      break
    case 'seek':
      this._totalTimeInvisible = 0
      // Do nothing
      break
    }
  }

  pause () {
    if (this._alternates) {
      switch (this.status) {
      case 'playing':
        this._cancelAnimate()

        window.requestAnimationFrame(timestamp => {
          this._pauseCache = {
            status: this.status,
            timeProgress: (timestamp - this._startTime) / this._duration,
          }
  
          this._paused()
        })
        break
      case 'reversing':
        this._cancelAnimate()

        window.requestAnimationFrame(timestamp => {
          this._pauseCache = {
            status: this.status,
            timeProgress: (timestamp - this._startTime) / this._duration,
          }
    
          this._paused()
        })
      }
    } else {
      switch (this.status) {
      case 'playing':
        this._cancelAnimate()
        
        window.requestAnimationFrame(timestamp => {
          this._pauseCache = {
            status: this.status,
            timeProgress: (timestamp - this._startTime) / this._duration,
          }
  
          this._paused()
        })
        break
      case 'reversing':
        this._cancelAnimate()
        
        window.requestAnimationFrame(timestamp => {
          this._pauseCache = {
            status: this.status,
            timeProgress: (timestamp - this._startTime) / this._duration,
          }
    
          this._paused()
        })
      }
    }

    return this
  }
  _paused () {
    this._computedStatus = 'paused'
  }
  _cancelAnimate () {
    window.cancelAnimationFrame(this.request)
  }

  seek (naiveTimeProgress, naiveCallback, options) { // Store time progress. Continue playing or reversing if applicable.
    const iterations = Math.floor(naiveTimeProgress),
          naiveIterationProgress = naiveTimeProgress - iterations

    this._computedIterations = iterations

    let timeProgress, callback

    if (this._alternates) {
      if (naiveIterationProgress <= .5) {
        timeProgress = naiveIterationProgress * 2

        switch (this._alternateCache.status) {
        case 'playing':
          this._cancelAnimate()
          this._seekCache = { timeProgress }
          this._sought()

          callback = isFunction(naiveCallback) ? naiveCallback : this._playCache.callback
          this.play(callback, this._playCache.options)

          break
        case 'reversing':
          this._cancelAnimate()
          this._seekCache = { timeProgress }
          this._sought()

          callback = isFunction(naiveCallback) ? naiveCallback : this._reverseCache.callback
          this.reverse(callback, this._reverseCache.options)

          break
        default:
          this._seekCache = { timeProgress }
          this._sought()

          callback = naiveCallback
          this._animate(callback, options, 'seek')

          break
        }
      } else {
        timeProgress = (naiveIterationProgress - .5) * 2
        switch (this._alternateCache.status) {
        case 'playing':
          this._cancelAnimate()
          this._seekCache = { timeProgress }
          this._sought()

          callback = isFunction(naiveCallback) ? naiveCallback : this._reverseCache.callback
          this.reverse(callback, this._reverseCache.options)

          break
        case 'reversing':
          this._cancelAnimate()
          this._seekCache = { timeProgress }
          this._sought()

          callback = isFunction(naiveCallback) ? naiveCallback : this._playCache.callback
          this.play(callback, this._playCache.options)

          break
        default:
          this._seekCache = { timeProgress }
          this._sought()

          callback = naiveCallback
          this._animate(callback, options, 'seek')

          break
        }
      }
    } else {
      timeProgress = naiveIterationProgress

      switch (this.status) {
      case 'playing':
        this._cancelAnimate()
        this._seekCache = { timeProgress }
        this._sought()

        callback = isFunction(naiveCallback) ? naiveCallback : this._playCache.callback
        this.play(callback, this._playCache.options)

        break
      case 'reversing':
        this._cancelAnimate()
        this._seekCache = { timeProgress }
        this._sought()

        callback = isFunction(naiveCallback) ? naiveCallback : this._reverseCache.callback
        this.reverse(callback, this._reverseCache.options)

        break
      default:
        this._seekCache = { timeProgress }
        this._sought()

        callback = naiveCallback
        this._animate(callback, options, 'seek')

        break
      }    
    }
    
    return this
  }
  _sought () {
    this._computedStatus = 'sought'
  }

  restart () { // Seek to progress 0 and play or reverse
    switch (this.status) {
    case 'played': // TODO: Pretty sure this could cause problems for alternating animations
      this.seek(0)
      this.play(this._playCache.callback, this._playCache.options)
      break
    case 'playing':
      this.seek(0)
      break
    case 'reversed': // TODO: Pretty sure this could cause problems for alternating animations
      this.seek(0)
      this.reverse(this._reverseCache.callback, this._reverseCache.options)
      break
    case 'reversing':
      this.seek(0)
      break
    case 'paused':
      switch (this._pauseCache.status) {
      case 'playing':
        this.seek(0)
        this.play(this._playCache.callback, this._playCache.options)
        break
      case 'reversing':
        this.seek(0)
        this.reverse(this._reverseCache.callback, this._reverseCache.options)
        break
      }
    }

    return this
  }
  
  stop () {
    switch (this.status) {
    case 'ready':
    case undefined:
      // Do nothing. Don't use web APIs during construction or before doing anything else.
      break
    default:
      this._cancelAnimate()
      this._visibilitychange.stop()
      this._alternateCache.status = 'ready'
      this._stopped()
      break
    }
    
    return this
  }
  _stopped () {
    this._computedStatus = 'stopped'
  }
}
