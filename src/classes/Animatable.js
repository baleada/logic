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
    // TODO: Pause? Stop?
    this.keyframes = keyframes
    this.keyframes.sort(byProgress)

    this._reversedKeyframes = this.keyframes
      .slice().reverse() // Reverse without mutating
      .map(({ progress, data }) => ({ progress: 1 - progress, data }))

    return this
  }

  play (callback, options) { // Play from current time
    switch (this.status) {
    case 'ready':
    case 'stopped':
    case 'played':
    case 'reversed':
    case 'paused':
      this._animate(callback, options, 'play')
      break
    case 'reversing':
      this.pause()
      this._animate(callback, options, 'play')
      break
    }
    
    return this
  }
  _playing = function() {
    this._computedStatus = 'playing'
  }
  _played = function() {
    this._computedStatus = 'played'
  }

  reverse (callback, options) { // Reverse from current time
    switch (this.status) {
      case 'ready':
      case 'stopped':
      case 'played':
      case 'reversed':
      case 'paused':
        this._animate(callback, options, 'reverse')
        break
      case 'playing':
        this.pause()
        this._animate(callback, options, 'reverse')
        break
      }
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
        case 'reversed':
        case 'stopped':
          this._startTime = timestamp
          this._playing()
          break
        case 'paused':
          switch (this._pauseData.status) {
          case 'playing':
            this._startTime = timestamp - (this._pauseData.pauseTime - this._pauseData.startTime)
            break
          case 'reversing':
            this._startTime = timestamp - (this._duration - (this._pauseData.pauseTime - this._pauseData.startTime))
            break
          }
          this._playing()
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
          switch (this._pauseData.status) {
          case 'playing':
            this._startTime = timestamp - (this._duration - (this._pauseData.pauseTime - this._pauseData.startTime))
            break
          case 'reversing':
            this._startTime = timestamp - (this._pauseData.pauseTime - this._pauseData.startTime)
            break
          }
          this._reversing()
        }
        break
      }

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
              time: { elapsed: elapsedTime, remaining: remainingTime, start: this._startTime, stamp: timestamp },
              progress: { time: timeProgress, animation: animationProgress },
              data: this._toEased(previousKeyframe.data, nextKeyframe.data, animationProgress, easeOptions)
            }

      callback(frame)

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
      const sliceToExact = (nextValue.length - previousValue.length) * progress + previousValue.length,
            nextValueIsLonger = nextValue.length > previousValue.length,
            sliceTo = nextValueIsLonger ? Math.floor(sliceToExact) : Math.ceil(sliceToExact),
            shouldBeSliced = nextValueIsLonger ? nextValue : previousValue
      easedValue = shouldBeSliced.slice(0, sliceTo)
      break
    }

    return easedValue
  }

  pause () {
    switch (this.status) {
    case 'playing':
    case 'reversing':
      window.requestAnimationFrame(timestamp => {
        this._cancelAnimate()
  
        this._pauseData = {
          status: this.status,
          startTime: this._startTime,
          pauseTime: timestamp,
        }
  
        this._paused()
      })
    }

    return this
  }
  _paused = function() {
    this._computedStatus = 'paused'
  }

  stop () {
    this._cancelAnimate()
    this._stopped()
    return this
  }
  _stopped = function() {
    this._computedStatus = 'stopped'
  }

  _cancelAnimate = function() {
    window.cancelAnimationFrame(this.request)
  }

  seek (timeProgress) { // Store time progress. Continue playing or reversing if applicable.

  }

  restart (callback) { // Seek to progress 0 and play or reverse
    switch (this.status) {
    case 'played':
    case 'playing':
      this.seek(0)
      return this.play(callback)
    case 'reversed':
    case 'reversing':
      this.seek(0)
      return this.reverse(callback)
    case 'paused':
      switch (this._pauseData.status) {
      case 'playing':
        this.seek(0)
        return this.play(callback)
      case 'reversing':
        this.seek(0)
        return this.reverse(callback)
      }
    }
  }
}
