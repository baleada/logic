/*
 * Delayable.js
 * (c) 2019 Alex Vipond
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
  #delay
  #isInterval
  #parameters
  #id
  #tickId
  #started
  #computedExecutions
  #computedTimeElapsed
  #computedTimeRemaining

  constructor (callback, options) {
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
    this.callback = callback

    /* Private properties */
    this.#computedExecutions = 0
    this.#computedTimeElapsed = 0
    this.#computedTimeRemaining = this.#delay
  }

  /* Public getters */
  /**
   * The number of times the callback function has been executed
   * @type {Number}
   */
  get executions () {
    return this.#computedExecutions
  }
  /**
   * The time (in milliseconds) that has elapsed since the callback function was initially delayed OR last executed, whichever is smaller
   * @type {Number}
   */
  get timeElapsed () {
    return this.#computedTimeElapsed
  }
  /**
   * The time (in milliseconds) that remains until the callback function will be executed
   * @type {Number}
   */
  get timeRemaining () {
    return this.#computedTimeRemaining
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
  clear () {
    window.clearTimeout(this.#id)
    window.clearInterval(this.#id)
    this.#stopTick()
    this.#computedExecutions = 0
  }
  /**
   * Executes the callback function after the period of time specified by <code>delay</code>
   */
  timeout () {
    this.#isInterval = false
    this.#setup()
    this.#id = this.#setTimeout()
  }
  /**
   * Repeatedly executes the callback function with a fixed time delay (specified by <code>delay</code>) between each execution
   */
  interval () {
    this.#isInterval = true
    this.#setup()
    this.#id = this.#setInterval()
  }

  /* Private methods */
  #setTimeout = function() {
    return window.setTimeout(
      () => {
        this.callback(...arguments)
        this.#stopTick()
        this.#computedTimeElapsed = this.#delay // Set timeElapsed to delay in case the user has switched tabs (which pauses requestAnimationFrame)
        this.#computedExecutions = 1
      },
      this.#delay,
      ...this.#parameters
    )
  }
  #setInterval = function() {
    return window.setInterval(
      () => {
        this.callback(...this.#parameters)
        this.#stopTick()
        this.#computedTimeElapsed = 0
        this.#computedExecutions++
        this.#startTick()
      },
      this.#delay,
    )
  }
  #setTimeElapsed = function() {
    const timeElapsed = Date.now() - this.#started
    this.#computedTimeElapsed = this.#isInterval
      ? timeElapsed - this.#delay * this.#computedExecutions
      : Math.min(timeElapsed, this.#delay)
  }
  #setTimeRemaining = function() {
    this.#computedTimeRemaining = this.#delay - this.#computedTimeElapsed
  }
  #tick = function() {
    this.#setTimeElapsed()
    this.#setTimeRemaining()
    if (this.#computedTimeElapsed < this.#delay) {
      this.#stopTick()
      this.#startTick()
    }
  }
  #startTick = function() {
    this.#tickId = window.requestAnimationFrame(this.#tick.bind(this))
  }
  #stopTick = function() {
    window.cancelAnimationFrame(this.#tickId)
  }
  #setup = function() {
    this.clear()
    this.#computedExecutions = 0
    this.#computedTimeElapsed = 0
    this.#computedTimeRemaining = this.#delay
    this.#started = Date.now()
    this.#startTick()
  }
}
