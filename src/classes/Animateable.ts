import BezierEasing from 'bezier-easing'
import {
  filter,
  pipe,
  reduce,
  map,
  reverse,
  toArray,
} from 'lazy-collections'
import {
  predicateFunction,
  toInterpolated,
} from '../extracted'
import {
  createConcat,
  createFilter,
  createReduce,
  createDeepMerge,
} from '../pipes'
import { defaultCreateMixOptions } from '../pipes/color'
import type { ColorInterpolationMethod, CreateMixOptions } from '../pipes'
import { Listenable } from './Listenable'

export type AnimateableKeyframe<Value extends string | number | any[]> = {
  progress: number,
  properties: {
    [key: string]: AnimateableValue<Value>
  },
  timing?: AnimateableTiming
}

export type AnimateableValue<Value extends string | number | any[]> = Value extends `${string} ${number}%` ? never : (Value | number | any[])

export function defineAnimateableKeyframes<Value extends string | number | any[]> (keyframes: AnimateableKeyframe<Value>[]) {
  return keyframes
}

export type AnimateableOptions = {
  duration?: number,
  timing?: AnimateableTiming,
  iterations?: number | true,
  alternates?: boolean
}

type AnimateableTiming = [number, number, number, number]

type AnimateableControlPoints = [{ x: number, y: number }, { x: number, y: number }]

export type AnimateFrameEffect = (frame?: AnimateFrame) => any

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
    color?: {
      method: ColorInterpolationMethod,
    } & CreateMixOptions
  }
}

type AnimateType = 'play' | 'reverse' | 'seek'

export type AnimateableStatus = 'ready' | 'playing' | 'played' | 'reversing' | 'reversed' | 'paused' | 'sought' | 'stopped'

const defaultOptions: AnimateableOptions = {
  duration: 0,
  // delay not supported, because it can be effectd by delayable
  timing: [
    0, 0,
    1, 1,
  ], // linear by default
  iterations: 1,
  alternates: false,
}

const defaultAnimateOptions: AnimateOptions = {
  interpolate: {
    color: {
      method: 'oklch',
      ...defaultCreateMixOptions,
    },
  },
}

/**
 * [Docs](https://baleada.dev/docs/logic/classes/animateable)
 */
export class Animateable<Value extends string | number | any[]> {
  private initialDuration: number
  private iterationLimit: number | true
  private alternates: boolean
  private controlPoints: AnimateableControlPoints
  private reversedControlPoints: AnimateableControlPoints
  private toAnimationProgress: BezierEasing.EasingFunction
  private reversedToAnimationProgress: BezierEasing.EasingFunction
  private playCache: { effect?: AnimateFrameEffect, options?: AnimateOptions }
  private reverseCache: { effect?: AnimateFrameEffect, options?: AnimateOptions }
  private pauseCache: { status?: 'playing' | 'reversing', timeProgress?: number }
  private seekCache: { timeProgress?: number }
  private alternateCache: { status: 'ready' | 'playing' | 'reversing' }
  private visibilitychange: Listenable<'visibilitychange'>
  private getEaseables: GetEaseables<Value>
  private getReversedEaseables: GetEaseables<Value>
  constructor (keyframes: AnimateableKeyframe<Value>[], options: AnimateableOptions = {}) {
    this.initialDuration = options?.duration || defaultOptions.duration
    this.controlPoints = fromTimingToControlPoints(options?.timing || defaultOptions.timing)
    this.iterationLimit = options?.iterations || defaultOptions.iterations
    this.alternates = options?.alternates || defaultOptions.alternates

    this.reversedControlPoints = fromControlPointsToReversedControlPoints(this.controlPoints)
    
    this.toAnimationProgress = createAnimationProgress(this.controlPoints)
    this.reversedToAnimationProgress = createAnimationProgress(this.reversedControlPoints)

    this.playCache = {}
    this.reverseCache = {}
    this.pauseCache = {}
    this.seekCache = {}
    this.alternateCache = { status: 'ready' }
    this.visibilitychange = new Listenable('visibilitychange')

    this.getEaseables = createGetEaseables(({ keyframe }) => keyframe.timing ? fromTimingToControlPoints(keyframe.timing) : this.controlPoints)
    this.getReversedEaseables = createGetEaseables(({ keyframe, index, propertyKeyframes }) => keyframe.timing ? fromControlPointsToReversedControlPoints(fromTimingToControlPoints(propertyKeyframes[index + 1].timing)) : this.reversedControlPoints)
    
    this.setKeyframes(keyframes)
    this.setPlaybackRate(1)
    this.ready()
    this.resetTime()
    this.resetProgress()
    this.resetIterations()
  }
  private computedStatus: AnimateableStatus
  private ready () {
    this.computedStatus = 'ready'
  }
  private computedTime: { elapsed: number, remaining: number }
  private resetTime () {
    this.computedTime = {
      elapsed: 0,
      remaining: this.duration,
    }
  }
  private computedProgress: { time: number, animation: number }
  private resetProgress () {
    this.computedProgress = {
      time: 0,
      animation: 0,
    }
  }
  private computedIterations: number
  private resetIterations () {
    this.computedIterations = 0
  }

  get keyframes () {
    return this.computedKeyframes
  }
  set keyframes (keyframes) {
    this.setKeyframes(keyframes)
  }
  get playbackRate () {
    return this.computedPlaybackRate
  }
  set playbackRate (playbackRate) {
    this.setPlaybackRate(playbackRate)
  }
  get status () {
    return this.computedStatus
  }
  get iterations () {
    return this.computedIterations
  }
  get request () {
    return this.computedRequest
  }
  get time () {
    return this.computedTime
  }
  get progress () {
    return this.computedProgress
  }

  private computedKeyframes: AnimateableKeyframe<Value>[]
  private reversedKeyframes: AnimateableKeyframe<Value>[]
  private properties: string[]
  private easeables: Easeable[]
  private reversedEaseables: Easeable[]
  setKeyframes (keyframes: AnimateableKeyframe<Value>[]) {
    this.stop()

    // Sort by progress without mutating original
    this.computedKeyframes = Array.from(keyframes).sort(({ progress: progressA }, { progress: progressB }) => progressA - progressB)

    this.reversedKeyframes = pipe(
      reverse(),
      map<AnimateableKeyframe<Value>, AnimateableKeyframe<Value>>(({ progress, properties }) => ({ progress: 1 - progress, properties })),
      toArray()
    )(this.keyframes) as AnimateableKeyframe<Value>[]

    this.properties = toProperties(this.keyframes)
    this.easeables = this.getEaseables({ keyframes: this.keyframes, properties: this.properties })
    this.reversedEaseables = this.getReversedEaseables({ keyframes: this.reversedKeyframes, properties: this.properties })

    return this
  }

  private computedPlaybackRate: number
  private duration: number
  private totalTimeInvisible: number
  setPlaybackRate (playbackRate: number) {
    const narrowedPlaybackRate = Math.max(0, playbackRate) // negative playback rate is not supported
    this.computedPlaybackRate = narrowedPlaybackRate
    this.duration = (1 / narrowedPlaybackRate) * this.initialDuration

    switch (this.status) {
      case 'playing':
      case 'reversing': 
        this.totalTimeInvisible = (1 / narrowedPlaybackRate) * this.totalTimeInvisible
        this.seek(this.progress.time)
        
        break
    }

    return this
  }

  play (effect: AnimateFrameEffect, options?: AnimateOptions) { // Play from current time progress
    this.playCache = {
      effect,
      options,
    }

    this.listenForVisibilitychange()

    if (this.alternates) {
      switch (this.alternateCache.status) {
        case 'ready':
          this.alternateCache.status = 'playing'
          break
      }
    }

    if (this.iterations === this.iterationLimit) {
      this.computedIterations = 0
    }

    switch (this.status) {
      case 'ready':
      case 'stopped':
      case 'played':
      case 'reversed':
      case 'sought':
        this.createAnimate('play')(effect, options)
        break
      case 'paused':
        if (this.alternates) {
          switch (this.alternateCache.status) {
            case 'playing':
              switch (this.pauseCache.status) {
                case 'playing':
                  this.createAnimate('play')(effect, options)
                  break
                case 'reversing':
                  this.createAnimate('reverse')(effect, options)
                  break
                }
              break
            case 'reversing':
              this.alternateCache.status = 'playing'
              switch (this.pauseCache.status) {
                case 'playing':
                  this.createAnimate('reverse')(effect, options)
                  break
                case 'reversing':
                  this.createAnimate('play')(effect, options)
                  break
              }
              break
          }
        } else {
          this.createAnimate('play')(effect, options)
        }
        break
      case 'reversing':
        this.pause()
        this.createAnimate('play')(effect, options)
        break
    }
    
    return this
  }
  private playing () {
    this.computedStatus = 'playing'
  }
  private played () {
    this.computedStatus = 'played'
  }

  reverse (effect: AnimateFrameEffect, options?: AnimateOptions) { // Reverse from current time progress
    this.reverseCache = {
      effect,
      options,
    }

    this.listenForVisibilitychange()

    if (this.alternates) {
      switch (this.alternateCache.status) {
        case 'ready':
          this.alternateCache.status = 'reversing'
          break
      }
    }

    if (this.iterations === this.iterationLimit) {
      this.computedIterations = 0
    }

    switch (this.status) {
      case 'ready':
      case 'stopped':
      case 'played':
      case 'reversed':
      case 'sought':
        this.createAnimate('reverse')(effect, options)
        break
      case 'paused':
        if (this.alternates) {
          switch (this.alternateCache.status) {
            case 'playing':
              this.alternateCache.status = 'reversing'
              switch (this.pauseCache.status) {
                case 'playing':
                  this.createAnimate('reverse')(effect, options)
                  break
                case 'reversing':
                  this.createAnimate('reverse')(effect, options)
                  break
              }
              break
            case 'reversing':
              switch (this.pauseCache.status) {
                case 'playing':
                  this.createAnimate('play')(effect, options)
                  break
                case 'reversing':
                  this.createAnimate('reverse')(effect, options)
                  break
              }
              break
          }
        } else {
          this.createAnimate('reverse')(effect, options)
        }
        break
      case 'playing':
        this.pause()
        this.createAnimate('reverse')(effect, options)
        break
    }
    
    return this
  }
  private reversing () {
    this.computedStatus = 'reversing'
  }
  private reversed () {
    this.computedStatus = 'reversed'
  }

  private invisibleAt: number
  private listenForVisibilitychange () {
    if (this.visibilitychange.active.size === 0) {
      this.totalTimeInvisible = 0

      this.visibilitychange.listen(({ timeStamp: timestamp }) => {
        switch (document.visibilityState) {
          case 'visible':
            this.totalTimeInvisible += timestamp - this.invisibleAt
            break
          default:
            this.invisibleAt = timestamp
            break
        }        
      })
    }
  }

  private computedRequest: number
  private createAnimate (type: AnimateType): (effect: (frame?: AnimateFrame) => any, options?: AnimateOptions) => this {
    return (effect, options = {}) => {
      const { interpolate: interpolateOptions } = createDeepMerge<AnimateOptions>(options)(defaultAnimateOptions)

      this.computedRequest = window.requestAnimationFrame(timestamp => {
        this.setStartTimeAndStatus(type, timestamp)

        const timeElapsed = Math.min((timestamp - this.startTime) - this.totalTimeInvisible, this.duration), // Might need to multiply visibility offset by something to get correct playback rate
              timeRemaining = this.duration - timeElapsed,
              timeProgress = timeElapsed / this.duration,
              toAnimationProgress = this.getToAnimationProgress(type),
              animationProgress = toAnimationProgress(timeProgress)

        this.computedTime = {
          elapsed: timeElapsed,
          remaining: timeRemaining,
        }

        this.computedProgress = {
          time: timeProgress,
          animation: animationProgress,
        }

        effect(this.getFrame(type, timeProgress, interpolateOptions, timestamp))

        this.recurse(type, timeRemaining, effect, options)
      })

      return this
    }
  }
  private startTime: number
  private setStartTimeAndStatus (type: AnimateType, timestamp: number) {
    switch (type) {
      case 'play':
        switch (this.status) {
          case 'ready':
          case 'played':
          case 'reversed':
          case 'stopped':
            this.startTime = timestamp
            this.playing()
            break
          case 'paused':
            switch (this.pauseCache.status) {
              case 'playing':
                this.startTime = timestamp - this.duration * this.pauseCache.timeProgress
                break
              case 'reversing':
                this.startTime = timestamp - (this.duration * (1 - this.pauseCache.timeProgress))
                break
            }
            this.playing()
            break
          case 'sought':
            this.startTime = timestamp - this.duration * this.seekCache.timeProgress
            this.playing()
            break
        }
        break
      case 'reverse':
        switch (this.status) {
          case 'ready':
          case 'played':
          case 'reversed':
          case 'stopped':
            this.startTime = timestamp
            this.reversing()
            break
          case 'paused':
            switch (this.pauseCache.status) {
              case 'playing':
                this.startTime = timestamp - (this.duration * (1 - this.pauseCache.timeProgress))
                break
              case 'reversing':
                this.startTime = timestamp - this.duration * this.pauseCache.timeProgress
                break
            }
            this.reversing()
            break
          case 'sought':
            this.startTime = timestamp - this.duration * this.seekCache.timeProgress
            this.reversing()
            break
        }
        break
      case 'seek':
        this.startTime = timestamp - this.duration * this.seekCache.timeProgress
        break
    }
  }
  private getToAnimationProgress (type: AnimateType) {
    switch (type) {
      case 'play':
      case 'seek':
        return this.toAnimationProgress.bind(this)
      case 'reverse':
        return this.reversedToAnimationProgress.bind(this)
    }
  }
  private getFrame (type: AnimateType, naiveTimeProgress: number, interpolateOptions: AnimateOptions['interpolate'], timestamp: number): AnimateFrame {
    const easeables = (() => {
      switch (type) {
        case 'play':
        case 'seek':
          return this.easeables
        case 'reverse':
          return this.reversedEaseables
        }
    })()

    return pipe(
      filter<Easeable>(({ progress: { start, end } }) => start < naiveTimeProgress && end >= naiveTimeProgress),
      reduce<AnimateFrame, Easeable>(
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
    )(easeables)
  }
  private recurse (type: AnimateType, timeRemaining: number, effect: AnimateFrameEffect, options?: AnimateOptions) {
    switch (type) {
      case 'play':
        if (timeRemaining <= 0) {
          this.played()
          this.totalTimeInvisible = 0

          if (this.alternates) {
            switch (this.alternateCache.status) {
              case 'playing':
                this.createAnimate('reverse')(effect, options)
                break
              case 'reversing':
                this.computedIterations += 1

                if (this.iterationLimit === true || this.iterations < this.iterationLimit) {
                  this.createAnimate('reverse')(effect, options)
                } else {
                  this.alternateCache.status = 'ready'
                }
                break
            }
          } else {
            this.computedIterations += 1

            if (this.iterationLimit === true || this.iterations < this.iterationLimit) {
              this.createAnimate('play')(effect, options)
            }
          }
        } else {
          this.createAnimate('play')(effect, options)
        }
        break
      case 'reverse':
        if (timeRemaining <= 0) {
          this.reversed()
          this.totalTimeInvisible = 0

          if (this.alternates) {
            switch (this.alternateCache.status) {
              case 'playing':
                this.computedIterations += 1

                if (this.iterationLimit === true || this.iterations < this.iterationLimit) {
                  this.createAnimate('play')(effect, options)
                } else {
                  this.alternateCache.status = 'ready'
                }

                break
              case 'reversing':
                this.createAnimate('play')(effect, options)
                break
            }
          } else {
            this.computedIterations += 1

            if (this.iterationLimit === true || this.iterations < this.iterationLimit) {
              this.createAnimate('reverse')(effect, options)
            }
          }
        } else {
          this.createAnimate('reverse')(effect, options)
        }
        break
      case 'seek':
        this.totalTimeInvisible = 0
        // Do nothing
        break
    }
  }

  pause () {
    if (this.alternates) {
      switch (this.status) {
        case 'playing':
          this.cancelAnimate()

          window.requestAnimationFrame(timestamp => {
            this.pauseCache = {
              status: this.status as 'playing' | 'reversing',
              timeProgress: (timestamp - this.startTime) / this.duration,
            }
    
            this.paused()
          })
          break
        case 'reversing':
          this.cancelAnimate()

          window.requestAnimationFrame(timestamp => {
            this.pauseCache = {
              status: this.status as 'playing' | 'reversing',
              timeProgress: (timestamp - this.startTime) / this.duration,
            }
      
            this.paused()
          })
      }
    } else {
      switch (this.status) {
        case 'playing':
          this.cancelAnimate()
          
          window.requestAnimationFrame(timestamp => {
            this.pauseCache = {
              status: this.status as 'playing' | 'reversing',
              timeProgress: (timestamp - this.startTime) / this.duration,
            }
    
            this.paused()
          })
          break
        case 'reversing':
          this.cancelAnimate()
          
          window.requestAnimationFrame(timestamp => {
            this.pauseCache = {
              status: this.status as 'playing' | 'reversing',
              timeProgress: (timestamp - this.startTime) / this.duration,
            }
      
            this.paused()
          })
      }
    }

    return this
  }
  private paused () {
    this.computedStatus = 'paused'
  }
  private cancelAnimate () {
    window.cancelAnimationFrame(this.request)
  }

  seek (timeProgress: number, options: { effect?: AnimateFrameEffect } & AnimateOptions = {}) { // Store time progress. Continue playing or reversing if applicable.
    const iterations = Math.floor(timeProgress),
          naiveIterationProgress = timeProgress - iterations,
          { effect: naiveEffect } = options

    this.computedIterations = iterations

    let narrowedTimeProgress: number, effect: AnimateFrameEffect

    if (this.alternates) {
      if (naiveIterationProgress <= .5) {
        narrowedTimeProgress = naiveIterationProgress * 2

        switch (this.alternateCache.status) {
          case 'playing':
            this.cancelAnimate()
            this.seekCache = { timeProgress: narrowedTimeProgress }
            this.sought()

            effect = predicateFunction(naiveEffect) ? naiveEffect : this.playCache.effect
            this.play(effect, this.playCache.options)

            break
          case 'reversing':
            this.cancelAnimate()
            this.seekCache = { timeProgress: narrowedTimeProgress }
            this.sought()

            effect = predicateFunction(naiveEffect) ? naiveEffect : this.reverseCache.effect
            this.reverse(effect, this.reverseCache.options)

            break
          default:
            this.seekCache = { timeProgress: narrowedTimeProgress }
            this.sought()

            effect = naiveEffect
            this.createAnimate('seek')(effect, options)

            break
        }
      } else {
        narrowedTimeProgress = (naiveIterationProgress - .5) * 2
        switch (this.alternateCache.status) {
          case 'playing':
            this.cancelAnimate()
            this.seekCache = { timeProgress: narrowedTimeProgress }
            this.sought()

            effect = predicateFunction(naiveEffect) ? naiveEffect : this.reverseCache.effect
            this.reverse(effect, this.reverseCache.options)

            break
          case 'reversing':
            this.cancelAnimate()
            this.seekCache = { timeProgress: narrowedTimeProgress }
            this.sought()

            effect = predicateFunction(naiveEffect) ? naiveEffect : this.playCache.effect
            this.play(effect, this.playCache.options)

            break
          default:
            this.seekCache = { timeProgress: narrowedTimeProgress }
            this.sought()

            effect = naiveEffect

            if (effect) {
              this.createAnimate('seek')(effect, options)
            }

            break
        }
      }
    } else {
      narrowedTimeProgress = naiveIterationProgress

      switch (this.status) {
        case 'playing':
          this.cancelAnimate()
          this.seekCache = { timeProgress: narrowedTimeProgress }
          this.sought()

          effect = predicateFunction(naiveEffect) ? naiveEffect : this.playCache.effect
          this.play(effect, this.playCache.options)

          break
        case 'reversing':
          this.cancelAnimate()
          this.seekCache = { timeProgress: narrowedTimeProgress }
          this.sought()

          effect = predicateFunction(naiveEffect) ? naiveEffect : this.reverseCache.effect
          this.reverse(effect, this.reverseCache.options)

          break
        default:
          this.seekCache = { timeProgress: narrowedTimeProgress }
          this.sought()

          effect = naiveEffect

          if (effect) {
            this.createAnimate('seek')(effect, options)
          }

          break
      }    
    }
    
    return this
  }
  private sought () {
    this.computedStatus = 'sought'
  }

  restart () { // Seek to progress 0 and play or reverse
    switch (this.status) {
      case 'played': // TODO: Pretty sure this could cause problems for alternating animations
        this.seek(0)
        this.play(this.playCache.effect, this.playCache.options)
        break
      case 'playing':
        this.seek(0)
        break
      case 'reversed': // TODO: Pretty sure this could cause problems for alternating animations
        this.seek(0)
        this.reverse(this.reverseCache.effect, this.reverseCache.options)
        break
      case 'reversing':
        this.seek(0)
        break
      case 'paused':
        switch (this.pauseCache.status) {
          case 'playing':
            this.seek(0)
            this.play(this.playCache.effect, this.playCache.options)
            break
          case 'reversing':
            this.seek(0)
            this.reverse(this.reverseCache.effect, this.reverseCache.options)
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
        this.cancelAnimate()
        this.visibilitychange.stop()
        this.alternateCache.status = 'ready'
        this.stopped()
        break
    }
    
    return this
  }
  private stopped () {
    this.computedStatus = 'stopped'
  }
}

export type Easeable = {
  property: string,
  value: { previous: string | number | any[], next: string | number | any[] },
  progress: { start: number, end: number },
  hasCustomTiming: boolean,
  toAnimationProgress: BezierEasing.EasingFunction
}

type GetEaseables<Value extends string | number | any[]> = ({ properties, keyframes }: { properties: string[], keyframes: AnimateableKeyframe<Value>[] }) => Easeable[]

type FromKeyframeToControlPoints<Value extends string | number | any[]> = (
  { keyframe, index, propertyKeyframes }: {
    keyframe: AnimateableKeyframe<Value>,
    index: number,
    propertyKeyframes: AnimateableKeyframe<Value>[]
  }
) => AnimateableControlPoints

export function createGetEaseables<Value extends string | number | any[]> (fromKeyframeToControlPoints: FromKeyframeToControlPoints<Value>): GetEaseables<Value> {
  return ({ properties, keyframes }) => {
    const fromPropertiesToEasables = createReduce<string, Easeable[]>(
      (easeables: Easeable[], property: string) => {
        const propertyKeyframes = createFilter<AnimateableKeyframe<Value>>(({ properties }) => properties.hasOwnProperty(property))(keyframes),
              fromKeyframesToEaseables = createReduce<AnimateableKeyframe<Value>, Easeable[]>(
                (propertyEaseables: Easeable[], keyframe: AnimateableKeyframe<Value>, index: number): Easeable[] => {
                  const previous = keyframe.properties[property],
                        next = index === propertyKeyframes.length - 1 ? previous : propertyKeyframes[index + 1].properties[property],
                        start = keyframe.progress,
                        end = index === propertyKeyframes.length - 1 ? 2 : propertyKeyframes[index + 1].progress,
                        hasCustomTiming = !!keyframe.timing,
                        toAnimationProgress = index === propertyKeyframes.length - 1
                          ? () => 1
                          : createAnimationProgress(fromKeyframeToControlPoints({ keyframe, index, propertyKeyframes }))

                  propertyEaseables.push({
                    property,
                    value: { previous, next },
                    progress: { start, end },
                    hasCustomTiming,
                    toAnimationProgress,
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
                toAnimationProgress: () => 1,
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

export function toProperties<Value extends string | number | any[]> (keyframes: AnimateableKeyframe<Value>[]): string[] {
  const properties = new Set<string>()

  for (const keyframe of keyframes) {
    for (const property in keyframe.properties) {
      if (!properties.has(property)) {
        properties.add(property)
      }
    }
  }
  
  return [...properties]
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


export function createAnimationProgress (points: AnimateableControlPoints) {
  const { 0: { x: point1x, y: point1y }, 1: { x: point2x, y: point2y } } = points
  return BezierEasing(point1x, point1y, point2x, point2y)
}

export const linear: AnimateableKeyframe<any>['timing'] = [
  0   , 0   ,
  1   , 1   ,
]

// Material Design and Tailwind
export const materialStandard: AnimateableKeyframe<any>['timing'] = [
  0.4 , 0   ,
  0.2 , 1   ,
]
export const materialDecelerated: AnimateableKeyframe<any>['timing'] = [
  0   , 0   ,
  0.2 , 1   ,
]
export const materialAccelerated: AnimateableKeyframe<any>['timing'] = [
  0.4 , 0   ,
  1   , 1   ,
]

// Lea Verou
export const verouEase: AnimateableKeyframe<any>['timing'] = [
  0.25, 0.1 ,
  0.25, 1   ,
]
export const verouEaseIn: AnimateableKeyframe<any>['timing'] = [
  0.42, 0   ,
  1   , 1   ,
]
export const verouEaseOut: AnimateableKeyframe<any>['timing'] = [
  0   , 0   ,
  0.58, 1   ,
]
export const verouEaseInOut: AnimateableKeyframe<any>['timing'] = [
  0.42, 0   ,
  0.58, 1   ,
]

// easings.net
export const easingsNetInSine: AnimateableKeyframe<any>['timing'] = [
  0.12, 0   ,
  0.39, 0   ,
]
export const easingsNetOutSine: AnimateableKeyframe<any>['timing'] = [
  0.61, 1   ,
  0.88, 1   ,
]
export const easingsNetInOutSine: AnimateableKeyframe<any>['timing'] = [
  0.37, 0   ,
  0.63, 1   ,
]
export const easingsNetInQuad: AnimateableKeyframe<any>['timing'] = [
  0.11, 0   ,
  0.5 , 0   ,
]
export const easingsNetOutQuad: AnimateableKeyframe<any>['timing'] = [
  0.5 , 1   ,
  0.89, 1   ,
]
export const easingsNetInOutQuad: AnimateableKeyframe<any>['timing'] = [
  0.45, 0   ,
  0.55, 1   ,
]
export const easingsNetInCubic: AnimateableKeyframe<any>['timing'] = [
  0.32, 0   ,
  0.67, 0   ,
]
export const easingsNetOutCubic: AnimateableKeyframe<any>['timing'] = [
  0.33, 1   ,
  0.68, 1   ,
]
export const easingsNetInOutCubic: AnimateableKeyframe<any>['timing'] = [
  0.65, 0   ,
  0.35, 1   ,
]
export const easingsNetInQuart: AnimateableKeyframe<any>['timing'] = [
  0.5 , 0   ,
  0.75, 0   ,
]
export const easingsNetInQuint: AnimateableKeyframe<any>['timing'] = [
  0.64, 0   ,
  0.78, 0   ,
]
export const easingsNetOutQuint: AnimateableKeyframe<any>['timing'] = [
  0.22, 1   ,
  0.36, 1   ,
]
export const easingsNetInOutQuint: AnimateableKeyframe<any>['timing'] = [
  0.83, 0   ,
  0.17, 1   ,
]
export const easingsNetInExpo: AnimateableKeyframe<any>['timing'] = [
  0.7 , 0   ,
  0.84, 0   ,
]
export const easingsNetOutExpo: AnimateableKeyframe<any>['timing'] = [
  0.16, 1   ,
  0.3 , 1   ,
]
export const easingsNetInOutExpo: AnimateableKeyframe<any>['timing'] = [
  0.87, 0   ,
  0.13, 1   ,
]
export const easingsNetInCirc: AnimateableKeyframe<any>['timing'] = [
  0.55, 0   ,
  1   , 0.45,
]
export const easingsNetOutCirc: AnimateableKeyframe<any>['timing'] = [
  0   , 0.55,
  0.45, 1   ,
]
export const easingsNetInOutCirc: AnimateableKeyframe<any>['timing'] = [
  0.85, 0   ,
  0.15, 1   ,
]
export const easingsNetInBack: AnimateableKeyframe<any>['timing'] = [
  0.36, 0   ,
  0.66,-0.56,
]
export const easingsNetOutBack: AnimateableKeyframe<any>['timing'] = [
  0.34, 1.56,
  0.64, 1   ,
]
export const easingsNetInOutBack: AnimateableKeyframe<any>['timing'] = [
  0.68,-0.6 ,
  0.32, 1.6 ,
]
