import BezierEasing from 'bezier-easing'
import { mix } from '@snigo.dev/color'
import { Listenable } from './Listenable'
import { isFunction, isUndefined, isNumber, isString, isArray } from '../util'
import {
  createUnique,
  createSlice,
  createMap,
  createFilter,
  createReduce,
  Pipeable,
  createConcat,
} from '../pipes'
import {
  filter as lazyCollectionFilter,
  pipe as lazyCollectionPipe,
  reduce as lazyCollectionReduce,
  toArray as lazyCollectionToArray
} from 'lazy-collections'

export type AnimateableKeyframe = {
  progress: number,
  properties: {
    [key: string]: number | string | any[]
  },
  timing?: AnimateableTiming
}

export type AnimateableOptions = {
  duration?: number,
  timing?: AnimateableTiming,
  iterations?: number | true,
  alternates?: boolean
}

type AnimateableTiming = [number, number, number, number]

type AnimateableControlPoints = [{ x: number, y: number }, { x: number, y: number }]

export type AnimateFrameHandler = (frame?: AnimateFrame) => any

export type AnimateFrame = {
  properties: {
    [key: string]: {
      progress: { time: number, animation: number },
      interpolated: number | string | any[]
    }
  },
  timestamp: number
}

export type AnimateOptions = {
  interpolate?: {
    colorModel?: 'rgb' | 'hsl' | 'lab' | 'lch' | 'xyz',
  }
}

type AnimateType = 'play' | 'reverse' | 'seek'

export type AnimateableStatus = 'ready' | 'playing' | 'played' | 'reversing' | 'reversed' | 'paused' | 'sought' | 'stopped'

const defaultOptions: AnimateableOptions = {
  duration: 0,
  // delay not supported, because it can be handled by delayable
  timing: [
    0, 0,
    1, 1,
  ], // linear by default
  iterations: 1,
  alternates: false,
}

export class Animateable {
  _initialDuration: number
  _iterationLimit: number | true
  _alternates: boolean
  _controlPoints: AnimateableControlPoints
  _reversedControlPoints: AnimateableControlPoints
  _toAnimationProgress: BezierEasing.EasingFunction
  _reversedToAnimationProgress: BezierEasing.EasingFunction
  _playCache: { handle?: AnimateFrameHandler, options?: AnimateOptions }
  _reverseCache: { handle?: AnimateFrameHandler, options?: AnimateOptions }
  _pauseCache: { status?: 'playing' | 'reversing', timeProgress?: number }
  _seekCache: { timeProgress?: number }
  _alternateCache: { status: 'ready' | 'playing' | 'reversing' }
  _visibilitychange: Listenable<Event>
  _getEaseables: GetEaseables
  _getReversedEaseables: GetEaseables
  constructor (keyframes: AnimateableKeyframe[], options: AnimateableOptions = {}) {
    this._initialDuration = options?.duration || defaultOptions.duration
    this._controlPoints = fromTimingToControlPoints(options?.timing || defaultOptions.timing)
    this._iterationLimit = options?.iterations || defaultOptions.iterations
    this._alternates = options?.alternates || defaultOptions.alternates

    this._reversedControlPoints = fromControlPointsToReversedControlPoints(this._controlPoints)
    
    this._toAnimationProgress = createToAnimationProgress(this._controlPoints)
    this._reversedToAnimationProgress = createToAnimationProgress(this._reversedControlPoints)

    this._playCache = {}
    this._reverseCache = {}
    this._pauseCache = {}
    this._seekCache = {}
    this._alternateCache = { status: 'ready' }
    this._visibilitychange = new Listenable('visibilitychange')

    this._getEaseables = createGetEaseables(({ keyframe }) => keyframe.timing ? fromTimingToControlPoints(keyframe.timing) : this._controlPoints)
    this._getReversedEaseables = createGetEaseables(({ keyframe, index, propertyKeyframes }) => keyframe.timing ? fromControlPointsToReversedControlPoints(fromTimingToControlPoints(propertyKeyframes[index + 1].timing)) : this._reversedControlPoints)
    
    this.setKeyframes(keyframes)
    this.setPlaybackRate(1)
    this._ready()
    this._resetTime()
    this._resetProgress()
    this._resetIterations()
  }
  _computedStatus: AnimateableStatus
  _ready () {
    this._computedStatus = 'ready'
  }
  _computedTime: { elapsed: number, remaining: number }
  _resetTime () {
    this._computedTime = {
      elapsed: 0,
      remaining: this._duration,
    }
  }
  _computedProgress: { time: number, animation: number }
  _resetProgress () {
    this._computedProgress = {
      time: 0,
      animation: 0,
    }
  }
  _computedIterations: number
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

  _computedKeyframes: AnimateableKeyframe[]
  _reversedKeyframes: AnimateableKeyframe[]
  _properties: string[]
  _easeables: Easeable[]
  _reversedEaseables: Easeable[]
  setKeyframes (keyframes: AnimateableKeyframe[]) {
    this.stop()

    // Sort by progress without mutating original
    this._computedKeyframes = Array.from(keyframes).sort(({ progress: progressA }, { progress: progressB }) => progressA - progressB)

    this._reversedKeyframes = new Pipeable(this.keyframes).pipe(
      // Reverse without mutating
      keyframes => Array.from(keyframes).reverse(), 
      reversedProgressMap
    )

    this._properties = toProperties(this.keyframes)
    this._easeables = this._getEaseables({ keyframes: this.keyframes, properties: this._properties })
    this._reversedEaseables = this._getReversedEaseables({ keyframes: this._reversedKeyframes, properties: this._properties })

    return this
  }

  _computedPlaybackRate: number
  _duration: number
  _totalTimeInvisible: number
  setPlaybackRate (playbackRate: number) {
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

  play (handle: AnimateFrameHandler, options?: AnimateOptions) { // Play from current time progress
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

  reverse (handle: AnimateFrameHandler, options?: AnimateOptions) { // Reverse from current time progress
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

  _invisibleAt: number
  _listenForVisibilitychange () {
    if (this._visibilitychange.active.size === 0) {
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

  _computedRequest: number
  _createAnimate (type: AnimateType): (handle: (frame?: AnimateFrame) => any, options?: AnimateOptions) => this {
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

        handle(this._getFrame(type, timeProgress, interpolateOptions, timestamp))

        this._recurse(type, timeRemaining, handle, options)
      })

      return this
    }
  }
  _startTime: number
  _setStartTimeAndStatus (type: AnimateType, timestamp: number) {
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
  _getToAnimationProgress (type: AnimateType) {
    switch (type) {
      case 'play':
      case 'seek':
        return this._toAnimationProgress.bind(this)
      case 'reverse':
        return this._reversedToAnimationProgress.bind(this)
    }
  }
  _getFrame (type: AnimateType, naiveTimeProgress: number, interpolateOptions: {}, timestamp: number): AnimateFrame {
    const easeables = (() => {
      switch (type) {
        case 'play':
        case 'seek':
          return this._easeables
        case 'reverse':
          return this._reversedEaseables
        }
    })()

    return lazyCollectionPipe(
      lazyCollectionFilter<Easeable>(({ progress: { start, end } }) => start < naiveTimeProgress && end >= naiveTimeProgress),
      lazyCollectionReduce<AnimateFrame, Easeable>(
        (frame, { property, progress, value: { previous, next }, toAnimationProgress }) => {
          const timeProgress = (naiveTimeProgress - progress.start) / (progress.end - progress.start),
                animationProgress = toAnimationProgress(timeProgress)

          frame.properties[property] = {
            progress: { time: timeProgress, animation: animationProgress },
            interpolated: toInterpolated({ previous, next, progress: animationProgress }, interpolateOptions),
          }
          
          return frame
        },
        { properties: {}, timestamp }
      ),
      lazyCollectionToArray()
    )(easeables)
  }
  _recurse (type: AnimateType, timeRemaining: number, handle: AnimateFrameHandler, options?: AnimateOptions) {
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
              status: this.status as 'playing' | 'reversing',
              timeProgress: (timestamp - this._startTime) / this._duration,
            }
    
            this._paused()
          })
          break
        case 'reversing':
          this._cancelAnimate()

          window.requestAnimationFrame(timestamp => {
            this._pauseCache = {
              status: this.status as 'playing' | 'reversing',
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
              status: this.status as 'playing' | 'reversing',
              timeProgress: (timestamp - this._startTime) / this._duration,
            }
    
            this._paused()
          })
          break
        case 'reversing':
          this._cancelAnimate()
          
          window.requestAnimationFrame(timestamp => {
            this._pauseCache = {
              status: this.status as 'playing' | 'reversing',
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

  seek (timeProgress: number, options: { handle?: AnimateFrameHandler } & AnimateOptions = {}) { // Store time progress. Continue playing or reversing if applicable.
    const iterations = Math.floor(timeProgress),
          naiveIterationProgress = timeProgress - iterations,
          { handle: naiveHandle } = options

    this._computedIterations = iterations

    let ensuredTimeProgress: number, handle: AnimateFrameHandler

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

            if (handle) {
              this._createAnimate('seek')(handle, options)
            }

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

          if (handle) {
            this._createAnimate('seek')(handle, options)
          }

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

const reversedProgressMap = createMap(({ progress, properties }) => ({ progress: 1 - progress, properties }))

type Easeable = {
  property: string,
  value: { previous: string | number | any[], next: string | number | any[] },
  progress: { start: number, end: number },
  hasCustomTiming: boolean,
  toAnimationProgress: BezierEasing.EasingFunction
}

type GetEaseables = (required: { properties: string[], keyframes: AnimateableKeyframe[] }) => Easeable[]

type FromKeyframeToControlPoints = (
  { keyframe, index, propertyKeyframes }: {
    keyframe: AnimateableKeyframe,
    index: number,
    propertyKeyframes: AnimateableKeyframe[]
  }
) => AnimateableControlPoints

export function createGetEaseables (fromKeyframeToControlPoints: FromKeyframeToControlPoints): GetEaseables {
  return ({ properties, keyframes }) => {
    const fromPropertiesToEasables = createReduce<string, Easeable[]>(
      (easeables: Easeable[], property: string) => {
        const propertyKeyframes = createFilter<AnimateableKeyframe>(({ properties }) => properties.hasOwnProperty(property))(keyframes),
              fromKeyframesToEaseables = createReduce<AnimateableKeyframe, Easeable[]>(
                (propertyEaseables: Easeable[], keyframe: AnimateableKeyframe, index: number): Easeable[] => {
                  const previous = keyframe.properties[property],
                        next = index === propertyKeyframes.length - 1 ? previous : propertyKeyframes[index + 1].properties[property],
                        start = keyframe.progress,
                        end = index === propertyKeyframes.length - 1 ? 2 : propertyKeyframes[index + 1].progress,
                        hasCustomTiming = !!keyframe.timing,
                        toAnimationProgress = index === propertyKeyframes.length - 1
                          ? timeProgress => 1
                          : createToAnimationProgress(fromKeyframeToControlPoints({ keyframe, index, propertyKeyframes }))

                  propertyEaseables.push({
                    property,
                    value: { previous, next },
                    progress: { start, end },
                    hasCustomTiming,
                    toAnimationProgress
                  })
                  
                  return propertyEaseables
                },
                []
              ),
              propertyEaseables = fromKeyframesToEaseables(propertyKeyframes),
              firstEaseable: Easeable = {
                property,
                value: { previous: propertyEaseables[0].value.previous, next: propertyEaseables[0].value.previous },
                progress: { start: -1, end: propertyEaseables[0].progress.start },
                toAnimationProgress: timeProgress => 1,
                hasCustomTiming: false,
              }
        
        return createConcat(
          easeables,
          [firstEaseable],
          propertyEaseables,
        )([])
      },
      []
    )
    
    return fromPropertiesToEasables(properties)
  }
}

export function toProperties (keyframes: AnimateableKeyframe[]): string[] {
  return createUnique<string>()(keyframes.map(({ properties }) => Object.keys(properties)).flat())
}

export function fromTimingToControlPoints(timing: AnimateableTiming): AnimateableControlPoints {
  const { 0: point1x, 1: point1y, 2: point2x, 3: point2y } = timing
  
  return [
    { x: point1x, y: point1y },
    { x: point2x, y: point2y },
  ]
}

export function fromControlPointsToReversedControlPoints (points: AnimateableControlPoints): AnimateableControlPoints {
  // This less complex reversal is why the control point objects are preferable
  return [
    { x: 1 - points[1].x, y: 1 - points[1].y },
    { x: 1 - points[0].x, y: 1 - points[0].y },
  ]
}


export function createToAnimationProgress (points: AnimateableControlPoints) {
  const { 0: { x: point1x, y: point1y }, 1: { x: point2x, y: point2y } } = points
  return BezierEasing(point1x, point1y, point2x, point2y)
}

export function toInterpolated (
  { previous, next, progress }: {
    previous: string | number | any[] | undefined,
    next: string | number | any[],
    progress: number
  },
  options: AnimateOptions['interpolate'] = {}
) {
  if (isUndefined(previous)) {
    return next
  }

  if (isNumber(previous) && isNumber(next)) {
    return (next  - previous) * progress + previous
  }

  if (isString(previous) && isString(next)) {
    return mix(
      options.colorModel,
      {
        start: previous,
        end: next,
        alpha: progress,
      }
    ).toRgb().toRgbString()
  }

  if (isArray(previous) && isArray(next)) {
    const exactSliceEnd = (next.length - previous.length) * progress + previous.length,
    nextIsLonger = next.length > previous.length,
    sliceEnd = nextIsLonger ? Math.floor(exactSliceEnd) : Math.ceil(exactSliceEnd),
    sliceTarget = nextIsLonger ? next : previous

    return createSlice({ from: 0, to: sliceEnd })(sliceTarget)
  }
}
