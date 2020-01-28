/*
 * Animatable.js
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
    this.keyframes = keyframes
    this.keyframes.sort(byProgress)

    this._reversedKeyframes = this.keyframes
      .slice().reverse() // Reverse without mutating
      .map(({ progress, data }) => ({ progress: 1 - progress, data }))

    return this
  }
  setFrame (newFrame) {
    this.frame = newFrame
    return this
  }

  play (callback, options) { // Play from current time
    // TODO: calling play while playing should have no effect
    return this._animate(callback, options, 'play')
  }
  _playing = function() {
    this._computedStatus = 'playing'
  }
  _played = function() {
    this._computedStatus = 'played'
  }

  reverse (callback, options) { // Reverse from current time
    // TODO: calling reverse while reversing should have no effect
    return this._animate(callback, options, 'reverse')
  }
  _reversing = function() {
    this._computedStatus = 'reversing'
  }
  _reversed = function() {
    this._computedStatus = 'reversed'
  }

  _animate = function(callback, options = {}, type) {
    const { ease: easeOptions } = options

    this._computedRequest = window.requestAnimationFrame(timestamp => {
      switch (type) {
      case 'play':
        switch (this.status) {
        case 'ready':
        case 'played':
          this._startTime = timestamp
          this._playing()
          break
        }
        break
      case 'reverse':
        switch (this.status) {
        case 'ready':
        case 'reversed':
          this._startTime = timestamp
          this._reversing()
          break
        }
        break
      }

      const toAnimationProgress = this._toToAnimationProgress(type),
            keyframes = this._toKeyframes(type),
            elapsedTime = Math.min(timestamp - this._startTime, this._duration), // TODO: selecting another browser tab screws with this. Should be possible to use visibility API (maybe via Listenable) to pause and resume
            remainingTime = this._duration - elapsedTime,
            timeProgress = elapsedTime / this._duration,
            animationProgress = toAnimationProgress(timeProgress),
            nextKeyframeIndex = timeProgress === 0
              ? 1
              : keyframes.findIndex(frame => frame.progress >= timeProgress),
            nextKeyframe = keyframes[nextKeyframeIndex],
            previousKeyframe = keyframes[nextKeyframeIndex - 1],
            frame = {
              time: { elapsed: elapsedTime, remaining: remainingTime, start: this._startTime, stamp: timestamp },
              progress: { time: timeProgress, animation: animationProgress },
              data: this._toEased(previousKeyframe.data, nextKeyframe.data, animationProgress, easeOptions)
            }

      callback(frame/*, callbackApi */) // TODO: keep an eye out for good stuff for a callback API

      switch (type) {
      case 'play':
        if (remainingTime <= 0) {
          this._played()
        } else {
          this._animate(callback, options, 'play')
        }
        break
      case 'reverse':
        if (remainingTime <= 0) {
          this._reversed()
        } else {
          this._animate(callback, options, 'reverse')
        }
        break
      }
    })

    return this
  }
  _toToAnimationProgress = function(type) {
    switch (type) {
    case 'play':
      return this._toAnimationProgress.bind(this)
    case 'reverse':
      return this._reversedToAnimationProgress.bind(this)
    }
  }
  _toKeyframes = function(type) {
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
      const sliceTo = Math.floor((nextValue.length - previousValue.length) * progress + previousValue.length),
            shouldBeSliced = nextValue.length > previousValue.length
              ? nextValue
              : previousValue
      easedValue = shouldBeSliced.slice(0, sliceTo)
      break
    }

    return easedValue
  }









  // pause (options = {}) { // Set time and stop playing
  //   if (this.status !== 'pausing') {
  //     this._cancelAnimate()
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
  
  // stop () {
  //   this._cancelAnimate()
  //   this._resetTime()
  //   this._stopped()
  //   return this
  // }
  // _stopped = function() {
  //   this._computedStatus = 'stopped'
  // }

  // _cancelAnimate = function() {
  //   window.cancelAnimationFrame(this.request)
  // }
}
