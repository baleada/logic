/*
 * Animatable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

/* Dependencies */
import BezierEasing from 'bezier-easing'
import { mix } from 'chroma-js/chroma-light'

/* Utils */
import { is, toTouchListeners } from '../util'

function byProgress ({ progress: progressA }, { progress: progressB }) {
  return progressA - progressB
}

export default class Animatable {
  constructor (keyframes, options = {}) {
    /* Options */
    options = {
      duration: 0,
      // delay can be handled by delayable
      timing: [
        { x: 1 / 3, y: 1 / 3 },
        { x: 2 / 3, y: 2 / 3 },
      ], // linear by default
      iterations: 1,
      alternates: false,
      fillMode: 'none',
      ...options
    }

    this._duration = options.duration
    this._timing = options.timing
    this._iterationLimit = options.iterations
    this._alternates = options.alternates
    this._fillMode = options.fillMode
    
    this._toAnimationProgress = this._getToAnimationProgress(this._timing)
    this._reversedToAnimationProgress = this._getToAnimationProgress(this._timing.reverse().map(({ x, y }) => ({ x: 1 - x, y: 1 - y })))

    this._computedIterations = 0

    this._playCache = {}
    this._reverseCache = {}
    this._pauseCache = {}
    this._seekCache = {}
    this._alternateCache = { status: 'ready' }

    /* Public properties */
    this.setKeyframes(keyframes)
    this._ready()
    this._resetTime()
    this._resetIterations()
  }
  _getToAnimationProgress (timing) {
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
      iterations: [],
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

  setKeyframes (keyframes) {
    this.stop()

    this.keyframes = keyframes
    this.keyframes.sort(byProgress)

    this._reversedKeyframes = this.keyframes
      .slice().reverse() // Reverse without mutating
      .map(({ progress, data }) => ({ progress: 1 - progress, data }))

    return this
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
      this._setStartTime(type, timestamp)

      const elapsedTime = Math.min(timestamp - this._startTime, this._duration), // TODO: selecting another browser tab screws with this. Should be possible to use visibility API (maybe via Listenable) to pause and resume
            remainingTime = this._duration - elapsedTime,
            timeProgress = elapsedTime / this._duration,
            toAnimationProgress = this._toToAnimationProgress(type),
            animationProgress = toAnimationProgress(timeProgress),
            keyframes = this._toKeyframes(type),
            nextKeyframeIndex = timeProgress === 0
              ? 1
              : keyframes.findIndex(frame => frame.progress >= timeProgress),
            nextKeyframe = keyframes[nextKeyframeIndex],
            previousKeyframe = keyframes[nextKeyframeIndex - 1],
            frame = {
              time: { elapsed: elapsedTime, remaining: remainingTime, stamp: timestamp },
              progress: { time: timeProgress, animation: animationProgress },
              data: this._toEased(previousKeyframe.data, nextKeyframe.data, animationProgress, easeOptions)
            }

      callback(frame)

      this._recurse(type, remainingTime, callback, options)
    })

    return this
  }
  _setStartTime (type, timestamp) {
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
    }
  }
  _toToAnimationProgress (type) {
    switch (type) {
    case 'play':
      return this._toAnimationProgress.bind(this)
    case 'reverse':
      return this._reversedToAnimationProgress.bind(this)
    }
  }
  _toKeyframes (type) {
    switch (type) {
    case 'play':
      return this.keyframes
    case 'reverse':
      return this._reversedKeyframes
    }
  }
  _toEased = function (previousData, nextData, progress, easeOptions) {
    return Object.keys(previousData)
      .reduce(
        (easedData, property) => ({ ...easedData, [property]: this._ease(previousData[property], nextData[property], progress, easeOptions) }),
        {}
      )
  }
  _ease = function (previousValue, nextValue, progress, options = {}) {
    let easedValue
    switch (true) {
    case is.undefined(nextValue):
      easedValue = previousValue
      break
    case is.number(previousValue):
      easedValue = (nextValue - previousValue) * progress + previousValue
      break
    case is.string(previousValue):
      const { colorMixMode } = options
      easedValue = mix(previousValue, nextValue, progress, colorMixMode)
      break
    case is.array(previousValue):
      const sliceToExact = (nextValue.length - previousValue.length) * progress + previousValue.length,
            nextValueIsLonger = nextValue.length > previousValue.length,
            sliceTo = nextValueIsLonger ? Math.floor(sliceToExact) : Math.ceil(sliceToExact),
            shouldBeSliced = nextValueIsLonger ? nextValue : previousValue
      easedValue = shouldBeSliced.slice(0, sliceTo)
      break
    }

    return easedValue
  }
  _recurse (type, remainingTime, callback, options) {
    switch (type) {
    case 'play':
      if (remainingTime <= 0) {
        this._played()

        if (this._alternates) {
          switch (this._alternateCache.status) {
          case 'playing':
            this._animate(callback, options, 'reverse')
            break
          case 'reversing':
            this._computedIterations += 1

            if (this.iterations < this._iterationLimit) {
              this._animate(callback, options, 'reverse')
            } else {
              this._alternateCache.status = 'ready'
            }

            break
          }
        } else {
          this._computedIterations += 1

          if (this.iterations < this._iterationLimit) {
            this._animate(callback, options, 'play')
          }
        }
      } else {
        this._animate(callback, options, 'play')
      }
      break
    case 'reverse':
      if (remainingTime <= 0) {
        this._reversed()

        if (this._alternates) {
          switch (this._alternateCache.status) {
          case 'playing':
            this._computedIterations += 1

            if (this.iterations < this._iterationLimit) {
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
            this._animate(callback, options, 'play')
          }
        }
      } else {
        this._animate(callback, options, 'reverse')
      }
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

  stop () {
    this._cancelAnimate()
    this._stopped()
    return this
  }
  _stopped () {
    this._computedStatus = 'stopped'
  }

  _cancelAnimate () {
    window.cancelAnimationFrame(this.request)
  }

  seek (naiveTimeProgress) { // Store time progress. Continue playing or reversing if applicable.
    let timeProgress

    if (this._alternates) {
      if (naiveTimeProgress <= .5) {
        timeProgress = naiveTimeProgress * 2
        switch (this._alternateCache.status) {
        case 'playing':
          this._cancelAnimate()
          this._seekCache = { timeProgress }
          this._sought()
          this.play(this._playCache.callback, this._playCache.options)
          break
        case 'reversing':
          this._cancelAnimate()
          this._seekCache = { timeProgress }
          this._sought()
          this.reverse(this._reverseCache.callback, this._reverseCache.options)
          break
        default:
          this._seekCache = { timeProgress }
          this._sought()
          // TODO: emit frame
          break
        }
      } else {
        timeProgress = (naiveTimeProgress - .5) * 2
        switch (this._alternateCache.status) {
        case 'playing':
          this._cancelAnimate()
          this._seekCache = { timeProgress }
          this._sought()
          this.reverse(this._reverseCache.callback, this._reverseCache.options)
          break
        case 'reversing':
          this._cancelAnimate()
          this._seekCache = { timeProgress }
          this._sought()
          this.play(this._playCache.callback, this._playCache.options)
          break
        default:
          this._seekCache = { timeProgress }
          this._sought()
          // TODO: emit frame
          break
        }
      }
    } else {
      timeProgress = naiveTimeProgress

      switch (this.status) {
      case 'playing':
        this._cancelAnimate()
        this._seekCache = { timeProgress }
        this._sought()
        this.play(this._playCache.callback, this._playCache.options)
        break
      case 'reversing':
        this._cancelAnimate()
        this._seekCache = { timeProgress }
        this._sought()
        this.reverse(this._reverseCache.callback, this._reverseCache.options)
        break
      default:
        this._seekCache = { timeProgress }
        this._sought()
        // TODO: emit frame
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
