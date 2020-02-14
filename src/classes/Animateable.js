/*
 * Animateable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

/* Dependencies */
import BezierEasing from 'bezier-easing'
import { mix } from 'chroma-js/chroma-light'

/* Utils */
import { is } from '../util'

function byProgress ({ progress: progressA }, { progress: progressB }) {
  return progressA - progressB
}

export default class Animateable {
  constructor (keyframes, options = {}) {
    /* Options */
    options = {
      duration: 0,
      // delay can be handled by delayable
      timing: [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ], // linear by default
      iterations: 1,
      alternates: false,
      ...options
    }

    this._duration = options.duration
    this._timing = options.timing
    this._reversedTiming = this._toReversedTiming(this._timing)
    this._iterationLimit = options.iterations
    this._alternates = options.alternates
    this._fillMode = options.fillMode
    
    this._toAnimationProgress = this._toToAnimationProgress(this._timing)
    this._reversedToAnimationProgress = this._toToAnimationProgress(this._reversedTiming)

    this._playCache = {}
    this._reverseCache = {}
    this._pauseCache = {}
    this._seekCache = {}
    this._alternateCache = { status: 'ready' }

    /* Public properties */
    this.setKeyframes(keyframes)
    this._ready()
    this._resetTime()
    this._resetProgress()
    this._resetIterations()
  }
  _toReversedTiming (timing) {
    return timing.reverse().map(({ x, y }) => ({ x: 1 - x, y: 1 - y }))
  }
  _toToAnimationProgress (timing) {
    const { 0: { x: p1x, y: p1y }, 1: { x: p2x, y: p2y } } = timing
    return BezierEasing(p1x, p1y, p2x, p2y)
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

  setKeyframes (keyframes) {
    this.stop()

    this.keyframes = keyframes
    this.keyframes.sort(byProgress)

    this._reversedKeyframes = this.keyframes
      .slice().reverse() // Reverse without mutating
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
                    hasCustomTiming = is.defined(keyframe.timing),
                    toAnimationProgress = index === array.length - 1
                      ? timeProgress => 1
                      : this._toToAnimationProgress((hasCustomTiming && keyframe.timing) || this._timing)

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
    // TODO: abstract and make more DRY
    return this._properties.reduce((easeables, property) => {
      const propertyKeyframes = this._reversedKeyframes.filter(({ data }) => data.hasOwnProperty(property)),
            propertyEaseables = propertyKeyframes.reduce((propertyEaseables, keyframe, index, array) => {
              const previous = keyframe.data[property],
                    next = index === array.length - 1 ? previous : array[index + 1].data[property],
                    start = keyframe.progress,
                    end = index === array.length - 1 ? 2 : array[index + 1].progress,
                    hasCustomTiming = is.defined(keyframe.timing),
                    toAnimationProgress = index === array.length - 1
                      ? timeProgress => 1
                      : this._toToAnimationProgress((hasCustomTiming && this._toReversedTiming(array[index + 1].timing)) || this._reversedTiming)

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

  play (callback, options) { // Play from current time progress
    this._playCache = {
      callback,
      options,
    }

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

  _animate (callback, options = {}, type) {
    const { ease: easeOptions } = options

    this._computedRequest = window.requestAnimationFrame(timestamp => {
      this._setStartTimeAndStatus(type, timestamp)

      const timeElapsed = Math.min(timestamp - this._startTime, this._duration), // TODO: selecting another browser tab screws with this. Should be possible to use visibility API (maybe via Listenable) to pause and resume
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
        data: this._getFrame(type, timeProgress, easeOptions),
        // TODO: Leaving the door open to include progress objects for each property
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
  _getFrame (type, naiveTimeProgress, easeOptions) {
    let easeables

    switch (type) {
    case 'play':
    case 'seek':
      easeables = this._easeables
      break
    case 'reverse':
      easeables = this._reversedEaseables
      break
    }

    return easeables
      .filter(({ progress: { start, end } }) => start < naiveTimeProgress && end >= naiveTimeProgress)
      .reduce((frame, { property, progress, value: { previous, next }, hasCustomTiming, toAnimationProgress }) => {
        const timeProgress = (naiveTimeProgress - progress.start) / (progress.end - progress.start),
              animationProgress = toAnimationProgress(timeProgress)
        
        return {
          ...frame,
          [property]: this._ease(previous, next, animationProgress, easeOptions)
        }
      }, {})
  }
  _ease (previous, next, progress, options = {}) {
    if (is.undefined(previous)) {
      return next
    } else {
      let eased
    
      // TODO validate matching previous and next types

      if (is.number(previous)) {
        eased = (next - previous) * progress + previous
      } else if (is.string(previous)) {
        const { colorMixMode } = options
        eased = mix(previous, next, progress, colorMixMode)
      } else if (is.array(previous)) {
        const sliceToExact = (next.length - previous.length) * progress + previous.length,
              nextIsLonger = next.length > previous.length,
              sliceTo = nextIsLonger ? Math.floor(sliceToExact) : Math.ceil(sliceToExact),
              shouldBeSliced = nextIsLonger ? next : previous
        eased = shouldBeSliced.slice(0, sliceTo)
      }
  
      return eased
    }
  }
  _recurse (type, timeRemaining, callback, options) {
    switch (type) {
    case 'play':
      if (timeRemaining <= 0) {
        this._played()

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
      // Do nothing
      break
    }
  }

  pause () {
    if (this._alternates) {
      switch (this.status) {
      case 'playing':
        window.requestAnimationFrame(timestamp => {
          this._cancelAnimate()

          this._pauseCache = {
            status: this.status,
            timeProgress: (timestamp - this._startTime) / this._duration,
          }
  
          this._paused()
        })
        break
      case 'reversing':
        window.requestAnimationFrame(timestamp => {
          this._cancelAnimate()
    
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
        window.requestAnimationFrame(timestamp => {
          this._cancelAnimate()
                
          this._pauseCache = {
            status: this.status,
            timeProgress: (timestamp - this._startTime) / this._duration,
          }
  
          this._paused()
        })
        break
      case 'reversing':
        window.requestAnimationFrame(timestamp => {
          this._cancelAnimate()
    
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

  stop (/* callback, options */) {
    this._cancelAnimate()
    this._alternateCache.status = 'ready'
    this._stopped()

    // this.seek(0, callback, options)

    return this
  }
  _stopped () {
    this._computedStatus = 'stopped'
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

          callback = is.function(naiveCallback) ? naiveCallback : this._playCache.callback
          this.play(callback, this._playCache.options)

          break
        case 'reversing':
          this._cancelAnimate()
          this._seekCache = { timeProgress }
          this._sought()

          callback = is.function(naiveCallback) ? naiveCallback : this._reverseCache.callback
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

          callback = is.function(naiveCallback) ? naiveCallback : this._reverseCache.callback
          this.reverse(callback, this._reverseCache.options)

          break
        case 'reversing':
          this._cancelAnimate()
          this._seekCache = { timeProgress }
          this._sought()

          callback = is.function(naiveCallback) ? naiveCallback : this._playCache.callback
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

        callback = is.function(naiveCallback) ? naiveCallback : this._playCache.callback
        this.play(callback, this._playCache.options)

        break
      case 'reversing':
        this._cancelAnimate()
        this._seekCache = { timeProgress }
        this._sought()

        callback = is.function(naiveCallback) ? naiveCallback : this._reverseCache.callback
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
}
