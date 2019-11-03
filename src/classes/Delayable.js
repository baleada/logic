/*
 * Delayable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

/* Util */

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
    /* Options */

    /* Public properties */
    /**
     * A shallow copy of the callback passed to the Delayable constructor
     * @type {Function}
     */
    this.callback = callback

    /* Private properties */
    this._computedExecutions = 0
    this._computedTimeElapsed = 0
    this._computedTimeRemaining = undefined
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
    return this
  }
  /**
   * Stops the delayed callback function. The function won't be executed, but <code>timeElapsed</code> and <code>timeRemaining</code> will <b>not</b> be reset to their initial values.
   */
  stop () {
    window.clearTimeout(this._id)
    window.clearInterval(this._id)
    this._stopTick()
    this._computedExecutions = 0
    return this
  }
  /**
   * Executes the callback function after the period of time specified by <code>delay</code>
   */
  timeout (delay = 0, parameters = []) {
    this._isInterval = false
    this._setup(delay)
    this._id = this._setTimeout(delay, parameters)
    return this
  }
  /**
   * Repeatedly executes the callback function with a fixed time delay (specified by <code>delay</code>) between each execution
   */
  interval (delay = 0, parameters = []) {
    this._isInterval = true
    this._setup(delay)
    this._id = this._setInterval(delay, parameters)
    return this
  }

  _setup = function(delay) {
    this.stop()
    this._computedExecutions = 0
    this._computedTimeElapsed = 0
    this._computedTimeRemaining = delay
    this._started = Date.now()
    this._startTick(delay)
  }
  _startTick = function(delay) {
    this._tickId = window.requestAnimationFrame(() => this._tick(delay))
  }
  _tick = function(delay) {
    this._setTimeElapsed(delay)
    this._setTimeRemaining(delay)
    if (this._computedTimeElapsed < delay) {
      this._stopTick()
      this._startTick(delay)
    }
  }
  _stopTick = function() {
    window.cancelAnimationFrame(this._tickId)
  }
  _setTimeElapsed = function(delay) {
    const timeElapsed = Date.now() - this._started
    this._computedTimeElapsed = this._isInterval
      ? timeElapsed - delay * this._computedExecutions
      : Math.min(timeElapsed, delay)
  }
  _setTimeRemaining = function(delay) {
    this._computedTimeRemaining = delay - this._computedTimeElapsed
  }
  _setTimeout = function(delay, parameters) {
    return window.setTimeout(
      (delay, parameters) => {
        this.callback(...parameters)
        this._stopTick()
        this._computedTimeElapsed = delay // Set timeElapsed to delay in case the user has switched tabs (which pauses requestAnimationFrame)
        this._computedExecutions = 1
      },
      delay,
      parameters
    )
  }
  _setInterval = function(delay, parameters) {
    return window.setInterval(
      (delay, parameters) => {
        this.callback(...parameters)
        this._stopTick()
        this._computedTimeElapsed = 0
        this._computedExecutions++
        this._startTick(delay)
      },
      delay,
      parameters
    )
  }
}
