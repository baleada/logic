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
  // _parameters
  // _id
  // _tickId
  // _computedStartTime
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
    this._computedTime = {
      start: undefined,
      lastExecution: undefined,
    }
    this._computedTimeElapsed = {
      total: 0,
      sinceLastExecution: 0,
    }
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
  get time () {
    return this._computedTime
  }
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
  timeout (options = {}) {
    const { delay, parameters } = options

    this._setup({ delay: delay || 0, isInterval: false })
    this._id = this._setTimeout({ delay: delay || 0, parameters: parameters || [] })

    return this
  }
  /**
   * Repeatedly executes the callback function with a fixed time delay (specified by <code>delay</code>) between each execution
   */
  interval (options = {}) {
    const { delay, parameters } = options

    this._setup({ delay: delay || 0, isInterval: true })
    this._id = this._setInterval({ delay: delay || 0, parameters: parameters || [] })

    return this
  }

  _setup = function({ delay, isInterval }) {
    this.stop()
    this._computedExecutions = 0
    this._computedTimeElapsed.sinceLastExecution = 0
    this._computedTimeRemaining = delay
    this._isFirstTick = true
    this._startTick({ delay, isInterval })
  }
  _startTick = function({ delay, isInterval }) {
    this._tickId = window.requestAnimationFrame(timestamp => this._tick({ timestamp, delay, isInterval }))
  }
  _tick = function({ timestamp, delay, isInterval }) {
    if (this._isFirstTick) {
      this._computedTime.start = timestamp
      this._isFirstTick = false
    }

    this._setTimeElapsed({ timestamp, delay, isInterval })
    this._setTimeRemaining({ delay })

    if (this.timeElapsed.sinceLastExecution < delay) {
      this._stopTick()
      this._startTick({ delay, isInterval }) // Ticks recursively as shown in example at https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
    }
  }
  _stopTick = function() {
    window.cancelAnimationFrame(this._tickId)
    this._isFirstTick = false
  }
  _setTimeElapsed = function({ timestamp, delay, isInterval }) {
    const timeElapsed = timestamp - this.time.start
    this._computedTimeElapsed.sinceLastExecution = isInterval
      ? timeElapsed - delay * this.executions
      : Math.min(timeElapsed, delay)

    this._computedTimeElapsed.total = this.timeElapsed.sinceLastExecution + delay * this.executions

    this._tickTimestamp = timestamp
  }
  _setTimeRemaining = function({ delay }) {
    this._computedTimeRemaining = delay - this.timeElapsed.sinceLastExecution
  }
  _setTimeout = function({ delay, parameters }) {
    return window.setTimeout(
      ({ delay, parameters }) => {
        this.callback(...parameters)
        this._stopTick()
        this._computedTimeElapsed.sinceLastExecution = delay // Set timeElapsed to delay in case the user has switched tabs (which pauses requestAnimationFrame)
        this._computedTimeElapsed.total = delay
        this._computedTime.lastExecution = this._tickTimestamp
        this._computedExecutions = 1
      },
      delay,
      { delay, parameters }
    )
  }
  _setInterval = function({ delay, parameters }) {
    return window.setInterval(
      ({ delay, parameters }) => {
        this.callback(...parameters)
        this._stopTick()
        this._computedTimeElapsed.sinceLastExecution = 0
        this._computedExecutions++
        this._computedTimeElapsed.total = delay * this.executions
        this._computedTime.lastExecution = this._tickTimestamp
        this._startTick({ delay, isInterval: true })
      },
      delay,
      { delay, parameters }
    )
  }
}
