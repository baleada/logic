/*
 * Animatable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

/* Dependencies */
import BezierEasing from 'bezier-easing'
import { mix } from 'chroma-js/chroma-light'

/* Utils */
import { is, typedEmit, emit } from '../util'

function byProgress ({ progress: progressA }, { progress: progressB }) {
  return progressB - progressA
}

function naiveDeepClone (object) {
  return JSON.parse(JSON.stringify(object)) // Deep copies everything except methods
}

export default class Animatable {
  constructor (keyframes, options = {}) {
    /* Options */
    options = {
      onAnimate: (newFrame, instance) => instance.setFrame(newFrame),
      duration: 0,
      // delay can be handled by delayable
      timing: [
        { x: 1 / 3, y: 1 / 3 },
        { x: 2 / 3, y: 2 / 3 },
      ], // cubic linear by default
      iterations: 1,
      direction: 'forwards',
      fillMode: 'none',
      ...options
    }

    this._duration = options.duration
    this._timing = options.timing
    this._iterations = options.iterations
    this._direction = options.direction
    this._fillMode = options.fillMode
    
    this._toAnimationProgress = this._getToAnimationProgress(this._timing)
    this._reversedToAnimationProgress = this._getToAnimationProgress(this._timing.reverse().map(({ x, y }) => ({ x: 1 - x, y: 1 - y })))

    this._onPlay = options.onPlay
    this._onPause = options.onPause
    this._onReverse = options.onReverse
    

    /* Public properties */
    this.setKeyframes(keyframes)
    this._ready()
    this._resetTime()
    this._resetIterations()
  }

  _getToAnimationProgress = function(timing) {
    const { 0: { x: p1x, y: p1y }, 1: { x: p2x, y: p2y } } = timing
    return BezierEasing(p1x, p1y, p2x, p2y)
  }
  _ready = function() {
    this._computedStatus = 'ready'
  }
  _resetTime = function() {
    this._computedTime = {
      elapsed: 0,
      remaining: this._duration,
      iterations: [],
    }
  }
  _resetIterations = function() {
    this._computedIterations = 0
  }

  get bezier () {
    return this._computedBezier
  }
  get reversedBezier () {
    return this._computedReversedBezier
  }
  get status () {
    return this._computedStatus
  }
  get iterations () {
    return this._computedIterations
  }
  get progress () {
    const { elapsed, remaining } = this.time,
          bezier = this._toBezier(),
          timeProgress = elapsed / (elapsed + remaining),
          animationProgress = bezier.get(timeProgress)

    return {
      time: timeProgress * 100,
      animation: animationProgress * 100,
    }
  }
  _toBezier = function() {
    return this.bezier
    // switch (this.status) {
    // case 'playing':
    //   return this.bezier
    // case 'reversing':
    //   return this.reversedBezier
    // }
  }

  get request () {
    return this._computedRequest
  }

  setKeyframes (keyframes) {
    // TODO: Pause? Stop?
    this.keyframes = keyframes.sort(byProgress)
    this._reversedKeyframes = keyframes.reverse().map(({ progress, data }) => ({ progress: 1 - progress, data }))
    return this
  }
  setFrame (newFrame) {
    this.frame = newFrame
    return this
  }

  play (callback, options = {}) { // Play from current time
    const { ease: easeOptions } = options

    this._computedRequest = window.requestAnimationFrame(timestamp => {
      switch (this.status) {
      case 'ready':
        this._startTime = timestamp
        this._computedStatus = 'playing'
        break
      }

      const elapsedTime = Math.min(timestamp - this._startTime, this._duration), // TODO: selecting another browser tab screws with this. Should be possible to use visibility API (maybe via Listenable) to pause and resume
            remainingTime = this._duration - elapsedTime,
            timeProgress = elapsedTime / this._duration,
            animationProgress = this._toAnimationProgress(timeProgress),
            nextKeyframeIndex = timeProgress === 0
              ? 1
              : this.keyframes.findIndex(frame => frame.progress >= timeProgress),
            nextKeyframe = this.keyframes[nextKeyframeIndex],
            previousKeyframe = this.keyframes[nextKeyframeIndex - 1],
            frame = {
              time: { elapsed: elapsedTime, remaining: remainingTime, start: this._startTime, stamp: timestamp },
              progress: { time: timeProgress, animation: animationProgress },
              data: this._toEased(previousKeyframe.data, nextKeyframe.data, animationProgress, easeOptions)
            }

      callback(frame)

      switch (true) {
      case remainingTime <= 0:
        this._played()
        break
      default:
        this.play(callback, options)
        break
      }
    })

    return this
  }
  _playing = function() {
    this._computedStatus = 'playing'
  }
  _played = function() {
    this._computedStatus = 'played'
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
      easedValue = (previousValue + nextValue) * progress
      break
    case is.string(previousValue):
      const { colorMixMode } = options
      easedValue = mix(previousValue, nextValue, progress, colorMixMode)
      break
    case is.array(previousValue):
      const sliceTo = Math.floor((previousValue.length + nextValue.length) * progress)
      easedValue = nextValue.slice(0, sliceTo)
      break
    }

    return easedValue
  }













  // reverse (options = {}) { // Play from current time using reversed keyframes
  //   if (this.status !== 'reversing') {
  //     this._cancelOnBeforeRepaint()
  //     this._reversing()
  //     const { time: timeProgress } = this.progress.time
  //     return this._animate(options)
  //   }

  //   return this
  //   this._reverse()
  //   return this._animate('reverse', options)
  // }
  // _reversing = function() {
  //   this._computedStatus = 'reversing'
  // }

  // pause (options = {}) { // Set time and stop playing
  //   if (this.status !== 'pausing') {
  //     this._cancelOnBeforeRepaint()
  //     this._pausing()
  //     const { time: timeProgress } = this.progress.time
  //     return this._animate(options)
  //   }

  //   return this
  // }
  // _pausing = function() {
  //   this._computedStatus = 'pausing'
  // }

  // seek (timeProgress, options = {}) { // Set time and continue pausing or playing
  //   options = {
  //     timeProgress,
  //     options,
  //   }
  //   this._seeking()
  //   return this._animate('seek', options)
  // }
  // _seeking = function() {
  //   this._computedStatus = 'seeking'
  // }

  // restart (options = {}) { // Set time to 0 and play
  //   this.seek(0)
  //   switch (this.status) {
  //   case 'playing':
  //     return this.play()
  //   case 'reversing':
  //     return this.reverse()
  //   }
  // }
  // _toLastIteration = function(timestamp) {
  //   switch (this.status) {
  //   case 'ready':
  //   case 'stopped':
  //   case 'played':
  //   case 'reversed':
  //     return { start: timestamp, end: timestamp + this._duration }
  //   case 'playing':
  //   case 'reversing':
  //   case 'pausing':
  //     return naiveDeepClone(this.time.lastIteration)
  //   }
  // }
  // _toKeyframes = function() {
  //   switch (this.status) {
  //   case 'playing':
  //     return this.keyframes
  //   case 'reversing':
  //     return this._reversedKeyframes
  //   }
  // }
  
  // stop () {
  //   this._cancelOnBeforeRepaint()
  //   this._resetTime()
  //   this._stopped()
  //   return this
  // }
  // _stopped = function() {
  //   this._computedStatus = 'stopped'
  // }

  // _onBeforeRepaint = function(callback) {
  //   this._computedRequest = window.requestAnimationFrame(callback)
  // }
  // _cancelOnBeforeRepaint = function() {
  //   window.cancelAnimationFrame(this.request)
  // }
}
