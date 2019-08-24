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
  #onSend
  #onResolve
  #onReject
  #dependency

  constructor(request, options = {}) {
    /* Options */
    this.#onSend = options.onSend
    this.#onResolve = options.onResolve
    this.#onReject = options.onReject

    /* Public properties */
    this.request = request

    /* Dependency */
    this.#dependency = new Dependency(request)
  }

  /* Public getters */

  /* Public methods */
  setRequest(request) {
    this.request = request
    return this
  }
  send() {
    if (is.function(this.#onSend)) this.#onSend()

    this.#dependency
      .send()
      .then((response) => {
        if (is.function(this.#onResolve)) this.#onResolve(response)
        return this
      })
      .catch((error) => {
        if (is.function(this.#onReject)) this.#onReject(error)
        return this
      })
  }

  // TODO: Support concurrent requests? (axios.all)

  /* Private methods */
}
