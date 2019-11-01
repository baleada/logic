/*
 * Delayable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

/* Util */
import is from '../util/is'

/**
 * Delayable is a library that enriches a function by:
 * - Giving it the methods necessary to execute itself after a delay or at regular intervals<
 * - Allowing it to store the time elapsed since it was delayed, the time remaining until it will be executed, and the number of times it has been executed
 * Delayable depends on `[setTimeout](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout)`, `[setInterval](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setInterval)`, `[requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)`, and the `[global Data object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)`, but is otherwise written in vanilla JS. Delayable powers <nuxt-link to="/docs/tools/composition-functions/useDelayable">`useDelayable`</nuxt-link>.
 */
export default class Delayable {
  // _delay
  // _isInterval
  // _parameters
  // _id
  // _tickId
  // _started
  // _computedExecutions
  // _computedTimeElapsed
  // _computedTimeRemaining

  constructor (callback, options) {
    options = {
      delay: 0,
      ...options
    }

    /* Options */
    this._delay = options.delay
    this._parameters = is.array(options.parameters) ? options.parameters : []

    /* Public properties */
    /**
     * A shallow copy of the callback passed to the Delayable constructor
     * @type {Function}
     */
    this.callback = callback

    /* Private properties */
    this._computedExecutions = 0
    this._computedTimeElapsed = 0
    this._computedTimeRemaining = this._delay
  }

  /* Public getters */
  /**
   * The number of times the callback function has been executed
   * @type {Number}
   */
  get executions () {
    return this._computedExecutions
  }
  /**
   * The time (in milliseconds) that has elapsed since the callback function was initially delayed OR last executed, whichever is smaller
   * @type {Number}
   */
  get timeElapsed () {
    return this._computedTimeElapsed
  }
  /**
   * The time (in milliseconds) that remains until the callback function will be executed
   * @type {Number}
   */
  get timeRemaining () {
    return this._computedTimeRemaining
  }

  /* Public methods */
  /**
   * Sets the Delayable instance's callback function
   * @param {Function} callback The new callback function
   */
  setCallback (callback) {
    this.callback = callback
  }
  /**
   * Clears the delayed callback function. The function won't be executed, but <code>timeElapsed</code> and <code>timeRemaining</code> will <b>not</b> be reset to their initial values.
   */
  stop () {
    window.clearTimeout(this._id)
    window.clearInterval(this._id)
    this._stopTick()
    this._computedExecutions = 0
  }
  /**
   * Executes the callback function after the period of time specified by <code>delay</code>
   */
  timeout () {
    this._isInterval = false
    this._setup()
    this._id = this._setTimeout()
  }
  /**
   * Repeatedly executes the callback function with a fixed time delay (specified by <code>delay</code>) between each execution
   */
  interval () {
    this._isInterval = true
    this._setup()
    this._id = this._setInterval()
  }

  /* Private methods */
  _setTimeout = function() {
    return window.setTimeout(
      () => {
        this.callback(...arguments)
        this._stopTick()
        this._computedTimeElapsed = this._delay // Set timeElapsed to delay in case the user has switched tabs (which pauses requestAnimationFrame)
        this._computedExecutions = 1
      },
      this._delay,
      ...this._parameters
    )
  }
  _setInterval = function() {
    return window.setInterval(
      () => {
        this.callback(...this._parameters)
        this._stopTick()
        this._computedTimeElapsed = 0
        this._computedExecutions++
        this._startTick()
      },
      this._delay,
    )
  }
  _setTimeElapsed = function() {
    const timeElapsed = Date.now() - this._started
    this._computedTimeElapsed = this._isInterval
      ? timeElapsed - this._delay * this._computedExecutions
      : Math.min(timeElapsed, this._delay)
  }
  _setTimeRemaining = function() {
    this._computedTimeRemaining = this._delay - this._computedTimeElapsed
  }
  _tick = function() {
    this._setTimeElapsed()
    this._setTimeRemaining()
    if (this._computedTimeElapsed < this._delay) {
      this._stopTick()
      this._startTick()
    }
  }
  _startTick = function() {
    this._tickId = window.requestAnimationFrame(this._tick.bind(this))
  }
  _stopTick = function() {
    window.cancelAnimationFrame(this._tickId)
  }
  _setup = function() {
    this.stop()
    this._computedExecutions = 0
    this._computedTimeElapsed = 0
    this._computedTimeRemaining = this._delay
    this._started = Date.now()
    this._startTick()
  }
}
