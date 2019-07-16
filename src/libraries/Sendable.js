/*
 * Sendable.js v1.0.0
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

import assignEnumerables from '../utils/assignEnumerables'
import is from '../utils/is'
import SendableDependency from '../wrappers/SendableAxios.js'

class Sendable {
  #dependencyOptions
  #onSend
  #onSuccess
  #onError
  #dependency

  constructor(request, options) {
    this.request = request

    this.#onSend = options.onSend
    this.#onSuccess = options.onSuccess
    this.#onError = options.onError
    this.#dependency = new SendableDependency(this.request)

    /* Public properties */
    /**
     * `true` when the request has been sent but not yet resolved or rejected, `false` when the request has been resolved or rejected OR when no request has been sent yet
     * @type {Boolean}
     */
    this.loading = false
    /**
     * The response or error returned by the request (if no request has been made yet, `response` is an empty object)
     * @type {Object}
     */
    this.response = {}

    /* Public methods */
    /**
     * [setRequest description]
     * @param {Object} request [description]
     */
    function setRequest(request) {
      this.request = request
    }
    /**
     * [send description]
     * @return {[type]} [description]
     */
    function send() {
      this.loading = true
      if (is.function(this.#onSend)) this.#onSend()

      this.#dependency
        .send()
        .then((response) => {
          this.response = response
          this.loading = false
          if (is.function(this.#onSuccess)) this.#onSuccess(this.response)
        })
        .catch((error) => {
          this.response = error
          this.loading = false
          if (is.function(this.#onError)) this.#onError(this.response)
        })
    }

    // TODO: Support concurrent requests? (axios.all)

    assignPublicMethods(this, {
      send
    })
  }

  // Private methods
  #getDependencyOptions = ({ onSuccess, onError, ...rest }) => ({ ...rest })
}

export default Sendable
