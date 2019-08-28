/*
 * Sendable.js
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

/* Dependencies */
import Dependency from '../wrappers/SendableAxios'

/* Utils */
import is from '../utils/is'

export default class Sendable {
  /* Private properties */
  #computedSending
  #computedResponse
  #computedError
  #dependency

  constructor(request, options = {}) {
    /* Options */

    /* Public properties */
    this.request = request

    /* Private properties */
    this.#computedSending = false
    this.#computedResponse = {}
    this.#computedError = {}

    /* Dependency */
    this.#dependency = new Dependency(request)
  }

  /* Public getters */
  get sending() {
    return this.#computedSending
  }
  get response() {
    return this.#computedResponse
  }
  get error() {
    return this.#computedError
  }

  /* Public methods */
  setRequest(request) {
    this.request = request
    return this
  }
  send() {
    this.#computedSending = true

    this.#dependency
      .send()
      .then((response) => {
        this.#computedSending = false
        this.#computedResponse = response
        return this
      })
      .catch((error) => {
        this.#computedSending = false
        this.#computedError = error
        return this
      })
  }

  // TODO: Support concurrent requests? (axios.all)

  /* Private methods */
}
