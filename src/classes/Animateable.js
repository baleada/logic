import BezierEasing from 'bezier-easing'
import mix from 'mix-css-color'
import { Listenable } from './Listenable.js'
import { isFunction, isUndefined, isNumber, isString, isArray } from '../util.js'
import { createUnique } from '../pipes.js'

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
   * @typedef {[number, number, number, number]} AnimateableTiming
   * @typedef {{ progress: number, data: { [key: string]: (number | string | any[]) }, timing?: AnimateableTiming }} AnimateableKeyframe
   * @typedef {{ duration?: number, timing?: AnimateableTiming, iterations?: number | true, alternates?: boolean }} AnimateableOptions
   * @param {AnimateableKeyframe[]} keyframes
   * @param {AnimateableOptions} [options]
   */
  constructor (keyframes, options = {}) {
    this._initialDuration = options?.duration || defaultOptions.duration
    this._controlPoints = fromTimingToControlPoints(options?.timing || defaultOptions.timing)
    this._iterationLimit = options?.iterations || defaultOptions.iterations
    this._alternates = options?.alternates || defaultOptions.alternates

    this._reversedControlPoints = fromTimingToReversedControlPoints(this._controlPoints)
    
    this._toAnimationProgress = createToAnimationProgress(this._controlPoints)
    this._reversedToAnimationProgress = createToAnimationProgress(this._reversedControlPoints)

    /**
     * @type {{ handle?: AnimateableFrameHandler, options?: AnimateOptions }}
     */
    this._playCache = {}
    /**
     * @type {{ handle?: AnimateableFrameHandler, options?: AnimateOptions }}
     */
    this._reverseCache = {}
    /**
     * @type {{ status?: 'playing' | 'reversing', timeProgress?: number }}
     */
    this._pauseCache = {}
    /**
     * @type {{ timeProgress?: number }}
     */
    this._seekCache = {}
    /**
     * @type {{ status: 'ready' | 'playing' | 'reversing' }}
     */
    this._alternateCache = { status: 'ready' }
    this._visibilitychange = new Listenable('visibilitychange')

    this._getEaseables = createGetEaseables(({ keyframe }) => keyframe.timing ? fromTimingToControlPoints(keyframe.timing) : this._controlPoints)
    this._getReversedEaseables = createGetEaseables(({ keyframe, index, array }) => keyframe.timing ? fromTimingToReversedControlPoints(fromTimingToControlPoints(array[index + 1].timing)) : this._reversedControlPoints)
    
    this.setKeyframes(keyframes)
    this.setPlaybackRate(1)
    this._ready()
    this._resetTime()
    this._resetProgress()
    this._resetIterations()
  }
  _ready () {
    /**
     * @type {'ready' | 'playing' | 'played' | 'reversing' | 'reversed' | 'paused' | 'sought' | 'stopped'}
     */
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

    // Sort by progress without mutating original
    this._computedKeyframes = Array.from(keyframes).sort(({ progress: progressA }, { progress: progressB }) => progressA - progressB)

    this._reversedKeyframes = Array.from(this.keyframes).reverse() // Reverse without mutating
      .map(({ progress, data }) => ({ progress: 1 - progress, data }))

    this._properties = toProperties(this.keyframes)
    this._easeables = this._getEaseables({ keyframes: this.keyframes, properties: this._properties })
    this._reversedEaseables = this._getReversedEaseables({ keyframes: this._reversedKeyframes, properties: this._properties })

    return this
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

  /**
   * @param {AnimateableFrameHandler} handle 
   * @param {AnimateOptions} [options]
   */
  play (handle, options) { // Play from current time progress
    this._playCache = {
      handle,
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
        this._createAnimate('play')(handle, options)
        break
      case 'paused':
        if (this._alternates) {
          switch (this._alternateCache.status) {
            case 'playing':
              switch (this._pauseCache.status) {
                case 'playing':
                  this._createAnimate('play')(handle, options)
                  break
                case 'reversing':
                  this._createAnimate('reverse')(handle, options)
                  break
                }
              break
            case 'reversing':
              this._alternateCache.status = 'playing'
              switch (this._pauseCache.status) {
                case 'playing':
                  this._createAnimate('play')(handle, options)
                  break
                case 'reversing':
                  this._createAnimate('play')(handle, options)
                  break
              }
              break
          }
        } else {
          this._createAnimate('play')(handle, options)
        }
        break
      case 'reversing':
        this.pause()
        this._createAnimate('play')(handle, options)
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

  /**
   * @param {AnimateableFrameHandler} handle 
   * @param {AnimateOptions} [options]
   */
  reverse (handle, options) { // Reverse from current time progress
    this._reverseCache = {
      handle,
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
        this._createAnimate('reverse')(handle, options)
        break
      case 'paused':
        if (this._alternates) {
          switch (this._alternateCache.status) {
            case 'playing':
              this._alternateCache.status = 'reversing'
              switch (this._pauseCache.status) {
                case 'playing':
                  this._createAnimate('reverse')(handle, options)
                  break
                case 'reversing':
                  this._createAnimate('reverse')(handle, options)
                  break
              }
              break
            case 'reversing':
              switch (this._pauseCache.status) {
                case 'playing':
                  this._createAnimate('play')(handle, options)
                  break
                case 'reversing':
                  this._createAnimate('reverse')(handle, options)
                  break
              }
              break
          }
        } else {
          this._createAnimate('play')(handle, options)
        }
        break
      case 'playing':
        this.pause()
        this._createAnimate('reverse')(handle, options)
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

  /**
   * @typedef {(frame?: AnimateableFrame) => any} AnimateableFrameHandler
   * @typedef {{ progress: { [key: string]: { time: number, animation: number } }, data: { [key: string]: number | string | any[] }, timestamp: number }} AnimateableFrame
   * @typedef {{ interpolate?: any }} AnimateOptions
   * @param {'play' | 'reverse' | 'seek'} type
   * @return {(handle: (frame?: AnimateableFrame) => any, options?: AnimateOptions) => this}
   */
  _createAnimate (type) {
    return (handle, options = {}) => {
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

        handle(frame)

        this._recurse(type, timeRemaining, handle, options)
      })

      return this
    }
  }
  /**
   * @param {'play' | 'reverse' | 'seek'} type
   * @param {number} timestamp
   */
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
  /**
   * @param {'play' | 'reverse' | 'seek'} type
   */
  _getToAnimationProgress (type) {
    switch (type) {
      case 'play':
      case 'seek':
        return this._toAnimationProgress.bind(this)
      case 'reverse':
        return this._reversedToAnimationProgress.bind(this)
    }
  }
  /**
   * @param {'play' | 'reverse' | 'seek'} type 
   * @param {number} naiveTimeProgress 
   * @param {number} interpolateOptions 
   * @return {{ progress: { [key: string]: { time: number, animation: number } }, data: { [key: string]: number | string | any[] }}}
   */
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
  /**
   * @param {'play' | 'reverse' | 'seek'} type
   * @param {number} timeRemaining
   * @param {AnimateableFrameHandler} handle
   * @param {AnimateOptions} options 
   */
  _recurse (type, timeRemaining, handle, options) {
    switch (type) {
      case 'play':
        if (timeRemaining <= 0) {
          this._played()
          this._totalTimeInvisible = 0

          if (this._alternates) {
            switch (this._alternateCache.status) {
              case 'playing':
                this._createAnimate('reverse')(handle, options)
                break
              case 'reversing':
                this._computedIterations += 1

                if (this.iterations < this._iterationLimit || this._iterationLimit === true) {
                  this._createAnimate('reverse')(handle, options)
                } else {
                  this._alternateCache.status = 'ready'
                }
                break
            }
          } else {
            this._computedIterations += 1

            if (this.iterations < this._iterationLimit || this._iterationLimit === true) {
              this._createAnimate('play')(handle, options)
            }
          }
        } else {
          this._createAnimate('play')(handle, options)
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
                  this._createAnimate('play')(handle, options)
                } else {
                  this._alternateCache.status = 'ready'
                }

                break
              case 'reversing':
                this._createAnimate('play')(handle, options)
                break
            }
          } else {
            this._computedIterations += 1

            if (this.iterations < this._iterationLimit) {
              this._createAnimate('reverse')(handle, options)
            }
          }
        } else {
          this._createAnimate('reverse')(handle, options)
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
              status: /** @type {'playing' | 'reversing'} */ (this.status),
              timeProgress: (timestamp - this._startTime) / this._duration,
            }
    
            this._paused()
          })
          break
        case 'reversing':
          this._cancelAnimate()

          window.requestAnimationFrame(timestamp => {
            this._pauseCache = {
              status: /** @type {'playing' | 'reversing'} */ (this.status),
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
              status: /** @type {'playing' | 'reversing'} */ (this.status),
              timeProgress: (timestamp - this._startTime) / this._duration,
            }
    
            this._paused()
          })
          break
        case 'reversing':
          this._cancelAnimate()
          
          window.requestAnimationFrame(timestamp => {
            this._pauseCache = {
              status: /** @type {'playing' | 'reversing'} */ (this.status),
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

  /**
   * @param {number} timeProgress 
   * @param {{ handle?: AnimateableFrameHandler } & AnimateOptions} [options]
   */
  seek (timeProgress, options) { // Store time progress. Continue playing or reversing if applicable.
    const iterations = Math.floor(timeProgress),
          naiveIterationProgress = timeProgress - iterations,
          { handle: naiveHandle } = options

    this._computedIterations = iterations

    let ensuredTimeProgress, handle

    if (this._alternates) {
      if (naiveIterationProgress <= .5) {
        ensuredTimeProgress = naiveIterationProgress * 2

        switch (this._alternateCache.status) {
          case 'playing':
            this._cancelAnimate()
            this._seekCache = { timeProgress: ensuredTimeProgress }
            this._sought()

            handle = isFunction(naiveHandle) ? naiveHandle : this._playCache.handle
            this.play(handle, this._playCache.options)

            break
          case 'reversing':
            this._cancelAnimate()
            this._seekCache = { timeProgress: ensuredTimeProgress }
            this._sought()

            handle = isFunction(naiveHandle) ? naiveHandle : this._reverseCache.handle
            this.reverse(handle, this._reverseCache.options)

            break
          default:
            this._seekCache = { timeProgress: ensuredTimeProgress }
            this._sought()

            handle = naiveHandle
            this._createAnimate('seek')(handle, options)

            break
        }
      } else {
        ensuredTimeProgress = (naiveIterationProgress - .5) * 2
        switch (this._alternateCache.status) {
          case 'playing':
            this._cancelAnimate()
            this._seekCache = { timeProgress: ensuredTimeProgress }
            this._sought()

            handle = isFunction(naiveHandle) ? naiveHandle : this._reverseCache.handle
            this.reverse(handle, this._reverseCache.options)

            break
          case 'reversing':
            this._cancelAnimate()
            this._seekCache = { timeProgress: ensuredTimeProgress }
            this._sought()

            handle = isFunction(naiveHandle) ? naiveHandle : this._playCache.handle
            this.play(handle, this._playCache.options)

            break
          default:
            this._seekCache = { timeProgress: ensuredTimeProgress }
            this._sought()

            handle = naiveHandle
            this._createAnimate('seek')(handle, options)

            break
        }
      }
    } else {
      ensuredTimeProgress = naiveIterationProgress

      switch (this.status) {
        case 'playing':
          this._cancelAnimate()
          this._seekCache = { timeProgress: ensuredTimeProgress }
          this._sought()

          handle = isFunction(naiveHandle) ? naiveHandle : this._playCache.handle
          this.play(handle, this._playCache.options)

          break
        case 'reversing':
          this._cancelAnimate()
          this._seekCache = { timeProgress: ensuredTimeProgress }
          this._sought()

          handle = isFunction(naiveHandle) ? naiveHandle : this._reverseCache.handle
          this.reverse(handle, this._reverseCache.options)

          break
        default:
          this._seekCache = { timeProgress: ensuredTimeProgress }
          this._sought()

          handle = naiveHandle
          this._createAnimate('seek')(handle, options)

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
        this.play(this._playCache.handle, this._playCache.options)
        break
      case 'playing':
        this.seek(0)
        break
      case 'reversed': // TODO: Pretty sure this could cause problems for alternating animations
        this.seek(0)
        this.reverse(this._reverseCache.handle, this._reverseCache.options)
        break
      case 'reversing':
        this.seek(0)
        break
      case 'paused':
        switch (this._pauseCache.status) {
          case 'playing':
            this.seek(0)
            this.play(this._playCache.handle, this._playCache.options)
            break
          case 'reversing':
            this.seek(0)
            this.reverse(this._reverseCache.handle, this._reverseCache.options)
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

/**
 * @typedef {{ property: string, value: { previous: string | number | any[], next: string | number | any[] }, progress: { start: number, end: number }, hasCustomTiming: boolean, toAnimationProgress: BezierEasing.EasingFunction }} Easeable
 * @param {(required: { keyframe: AnimateableKeyframe, index: number, array: AnimateableKeyframe[] }) => [{ x: number, y: number }, { x: number, y: number }]} fromKeyframeToControlPoints
 * @return {(required: { properties: string[], keyframes: AnimateableKeyframe[] }) => Easeable[]}
 */
export function createGetEaseables (fromKeyframeToControlPoints) {
  return ({ properties, keyframes }) => {
    return properties.reduce(
      /**
        * @param {Easeable[]} easeables 
        * @param {string} property 
        */
      (easeables, property) => {
        const propertyKeyframes = keyframes.filter(({ data }) => data.hasOwnProperty(property)),
              propertyEaseables = propertyKeyframes.reduce(
                /**
                  * @param {Easeable[]} propertyEaseables
                  * @param {AnimateableKeyframe} keyframe
                  * @param {number} index
                  * @param {AnimateableKeyframe[]} array
                  * @return {Easeable[]}
                  */
                (propertyEaseables, keyframe, index, array) => {
                  const previous = keyframe.data[property],
                        next = index === array.length - 1 ? previous : array[index + 1].data[property],
                        start = keyframe.progress,
                        end = index === array.length - 1 ? 2 : array[index + 1].progress,
                        hasCustomTiming = !!keyframe.timing,
                        toAnimationProgress = index === array.length - 1
                          ? timeProgress => 1
                          : createToAnimationProgress(fromKeyframeToControlPoints({ keyframe, index, array }))

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
                },
                []
              ),
              firstEaseable = /** @type {Easeable} */ ({
                property,
                value: { previous: propertyEaseables[0].value.previous, next: propertyEaseables[0].value.previous },
                progress: { start: -1, end: propertyEaseables[0].progress.start },
                toAnimationProgress: timeProgress => 1,
              })
        
        return [
          ...easeables,
          firstEaseable,
          ...propertyEaseables,
        ]
      },
      []
    )
  }

}

/**
 * 
 * @param {AnimateableKeyframe[]} keyframes
 */
 export function toProperties (keyframes) {
  return createUnique()(keyframes.map(({ data }) => Object.keys(data)).flat())
}

/**
 * 
 * @param {[number, number, number, number]} timing
 * @return {[{ x: number, y: number }, { x: number, y: number }]}
 */
 export function fromTimingToControlPoints(timing) {
  const { 0: point1x, 1: point1y, 2: point2x, 3: point2y } = timing
  
  return [
    { x: point1x, y: point1y },
    { x: point2x, y: point2y },
  ]
}

/**
 * @param {[{ x: number, y: number }, { x: number, y: number }]} points
 * @return {[{ x: number, y: number }, { x: number, y: number }]}
 */
export function fromTimingToReversedControlPoints (points) {
  // This easy reversal is why the control point objects are preferable
  return [
    { x: 1 - points[1].x, y: 1 - points[1].y },
    { x: 1 - points[0].x, y: 1 - points[0].y },
  ]
}

/**
 * @param {[{ x: number, y: number }, { x: number, y: number }]} points
 * @return {BezierEasing.EasingFunction}
 */
 export function createToAnimationProgress (points) {
  const { 0: { x: point1x, y: point1y }, 1: { x: point2x, y: point2y } } = points
  return BezierEasing(point1x, point1y, point2x, point2y)
}

/**
 * @template {string | number | any[]} T
 * @param {{ previous?: T, next: T, progress: number }} required
 * @param {object} [options]
 * @return T
 */
export function toInterpolated ({ previous, next, progress }, options = {}) {
  if (isUndefined(previous)) {
    return next
  }

  if (isNumber(previous) && isNumber(next)) {
    return (next  - previous) * progress + previous
  }

  if (isString(previous) && isString(next)) {
    return mix(previous, next, (1 - progress) * 100).hexa // No clue why this progress needs to be inverted, but it works
  }

  if (isArray(previous) && isArray(next)) {
    const sliceToExact = (next.length - previous.length) * progress + previous.length,
    nextIsLonger = next.length > previous.length,
    sliceTo = nextIsLonger ? Math.floor(sliceToExact) : Math.ceil(sliceToExact),
    shouldBeSliced = nextIsLonger ? next : previous

    return shouldBeSliced.slice(0, sliceTo)
  }
}
