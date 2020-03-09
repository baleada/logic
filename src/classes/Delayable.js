/*
 * Delayable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

import Animateable from './Animateable'

/**
 * Delayable is a library that enriches a function by:
 * - Giving it the methods necessary to execute itself after a delay or at regular intervals<
 * - Allowing it to store the time elapsed since it was delayed, the time remaining until it will be executed, and the number of times it has been executed
 * Delayable depends on `[setTimeout](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout)`, `[setInterval](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setInterval)`, `[requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)`, and the `[global Data object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)`, but is otherwise written in vanilla JS. Delayable powers <nuxt-link to="/docs/tools/composition-functions/useDelayable">`useDelayable`</nuxt-link>.
 */
export default class Delayable {
  constructor (callback, options) {
    options = {
      delay: 0,
      executions: 1,
      ...options
    }

    this._animateable = new Animateable(
      [
        { progress: 0, data: { progress: 0 } },
        { progress: 1, data: { progress: 1 } }
      ],
      {
        duration: options.delay,
        iterations: options.executions,
      }
    )

    this.setCallback(callback)
    this._ready()
  }
  _ready () {
    this._computedStatus = 'ready'
  }

  get callback () {
    return this._computedCallback
  }
  set callback (callback) {
    this.setCallback(callback)
  }
  get status () {
    return this._computedStatus
  }
  /**
   * The number of times the callback function has been executed
   * @type {Number}
   */
  get executions () {
    return this._animateable.iterations
  }
  /**
   * The time (in milliseconds) that has elapsed since the callback function was initially delayed OR last executed, whichever is smaller
   * @type {Number}
   */
  get time () {
    return this._animateable.time
  }
  get progress () {
    return this._animateable.progress.time
  }

  /**
   * Sets the Delayable instance's callback function
   * @param {Function} callback The new callback function
   */
  setCallback (naiveCallback) {
    this.stop()

    function callback (frame) {
      const { data: { progress }, timestamp } = frame

      if (progress === 1) {
        naiveCallback(timestamp)
        this._delayed()
      } else {
        switch (this.status) {
        case 'ready':
        case 'paused':
        case 'sought':
        case 'delayed':
        case 'stopped':
          this._delaying()
          break
        }
      }
    }

    this._computedCallback = callback

    return this
  }
  _delaying () {
    this._computedStatus = 'delaying'
  }
  _delayed () {
    this._computedStatus = 'delayed'
  }

  /**
   * Executes the callback function after the period of time specified by <code>delay</code>
   */
  delay () {
    switch (this.status) {
    case 'delaying':
      this._animateable.restart()
      break
    case 'sought':
      this.seek(0)
      this._animateable.play(frame => this.callback(frame))
      break
    case 'ready':
    case 'paused':
    case 'delayed':
    case 'stopped':
      this._animateable.play(frame => this.callback(frame))
    }    

    return this
  }

  pause () {
    switch (this.status) {
    case 'delaying':
      this._animateable.pause()
      this._paused()
      break
    }
    
    return this
  }
  _paused () {
    this._computedStatus = 'paused'
  }

  resume () {
    switch (this.status) {
    case 'paused':
    case 'sought':
      this._animateable.play(frame => this.callback(frame))
      break
    case 'ready':
    case 'delaying':
    case 'delayed':
    case 'stopped':
      // Do nothing
      break
    }

    return this
  }

  seek (timeProgress) {
    const executions = Math.floor(timeProgress)

  if (executions > 0) {case '      window':.requestAnimationFrame(timestamp => {
        for (let i = 0; i < executions; i++) {
          this.callback({
            data: { progress: 1 },
            timestamp
          })
        }
      })
    }

    this._animateable.seek(timeProgress, timestamp => this.callback(timestamp))
    this._sought()

    return this
  }
  _sought () {
    this._computedStatus = 'sought'
  }
  
  /**
   * Stops the delayed callback function. The function won't be executed, but <code>timeElapsed</code> and <code>timeRemaining</code> will <b>not</b> be reset to their initial values.
   */
  stop () {
    this._animateable.stop()
    this._stopped()

    return this
  }
  _stopped () {
    this._computedStatus = 'stopped'
  }
}
