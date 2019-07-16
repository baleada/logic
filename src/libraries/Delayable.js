/*
 * Delayable.js
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

import assignEnumerables from '../utils/assignEnumerables'

/**
 * Delayable is a library that enriches a function by:
 * - Giving it the methods necessary to execute itself after a delay or at regular intervals<
 * - Allowing it to store the time elapsed since it was delayed, the time remaining until it will be executed, and the number of times it has been executed
 * Delayable depends on `[setTimeout](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout)`, `[setInterval](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setInterval)`, `[requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)`, and the `[global Data object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)`, but is otherwise written in vanilla JS. Delayable powers <nuxt-link to="/docs/tools/composition-functions/useDelayable">`useDelayable`</nuxt-link>.
 */
class Delayable {
  /* Private properties */
  #delay
  #isInterval
  #parameters
  #id
  #tickId
  #started

  constructor(callback, options) {
    options = {
      delay: 0,
      ...options
    }

    /* Options */
    this.#delay = options.delay
    this.#parameters = is.array(options.parameters) ? options.parameters : []

    /* Public properties */
    /**
     * A shallow copy of the callback passed to the Delayable constructor
     * @type {Function}
     */
    callback = callback
    /**
     * The number of times the callback function has been executed
     * @type {Number}
     */
    const executions = 0
    /**
     * The time (in milliseconds) that has elapsed since the callback function was initially delayed OR last executed, whichever is smaller
     * @type {Number}
     */
    const timeElapsed = 0
    /**
     * The time (in milliseconds) that remains until the callback function will be executed
     * @type {Number}
     */
    const timeRemaining = this.#delay

    assignEnumerables(this, {
      callback,
      executions,
      timeElapsed,
      timeRemaining
    }, 'property')

    /* Public methods */
    /**
     * Sets the Delayable instance's callback function
     * @param {Function} callback The new callback function
     */
    function setCallback(callback) {
      this.callback = callback
    }
    /**
     * Cancels the delayed callback function. The function won't be executed, but <code>timeElapsed</code> and <code>timeRemaining</code> will <b>not</b> be reset to their initial values.
     */
    function cancel() {
      window.clearTimeout(this.#id)
      window.clearInterval(this.#id)
      this.#stopTick()
      this.executions = 0
    }
    /**
     * Executes the callback function after the period of time specified by <code>delay</code>
     */
    function timeout() {
      this.#isInterval = false
      this.#setup()
      this.#id = this.#setTimeout()
    }
    /**
     * Repeatedly executes the callback function with a fixed time delay (specified by <code>delay</code>) between each execution
     */
    function interval() {
      this.#isInterval = true
      this.#setup()
      this.#id = this.#setInterval()
    }

    assignPublicMethods(this, {
      setCallback,
      cancel,
      timeout,
      interval
    }, 'method')
  }

  /* Private methods */
  #setTimeout = function () {
    return window.setTimeout(
      () => {
        this.callback(...arguments)
        this.#stopTick()
        this.timeElapsed = this.#delay // Set timeElapsed to delay in case the user has switched tabs (which pauses requestAnimationFrame)
        this.executions = 1
      },
      this.#delay,
      ...this.#parameters
    )
  }
  #setInterval = function () {
    return window.setInterval(
      () => {
        this.callback(...this.#parameters)
        this.#stopTick()
        this.timeElapsed = 0
        this.executions++
        this.#startTick()
      },
      this.#delay,
    )
  }
  #setTimeElapsed = function () {
    const timeElapsed = Date.now() - this.#started
    this.timeElapsed = this.#isInterval
      ? timeElapsed - this.#delay * this.executions
      : Math.min(timeElapsed, this.#delay)
  }
  #setTimeRemaining = function () {
    this.timeRemaining = this.#delay - this.timeElapsed
  }
  #tick = function () {
    this.#setTimeElapsed()
    this.#setTimeRemaining()
    if (this.timeElapsed < this.#delay) {
      this.#stopTick()
      this.#startTick()
    }
  }
  #startTick = function () {
    this.#tickId = window.requestAnimationFrame(this.#tick.bind(this))
  }
  #stopTick = function () {
    window.cancelAnimationFrame(this.#tickId)
  }
  #setup = function () {
    this.cancel()
    this.executions = 0
    this.timeElapsed = 0
    this.timeRemaining = this.#delay
    this.#started = Date.now()
    this.#startTick()
  }
}

export default Delayable
