/*
 * Sendable.js v1.0.0
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

import assignPublicMethods from '../utils/assignPublicMethods'
import SendableDependency from './SendableAxios.js'

class Sendable {
  #dependencyOptions
  #onSuccess
  #onError
  #dependency

  constructor(request, options) {
    this.request = request

    this.#onSuccess = options.onSuccess
    this.#onError = options.onError
    this.#dependency = new SendableDependency(this.request)

    // Public properties
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

    // Public methods
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

      this.#dependency
        .send()
        .then((response) => {
          this.response = response
          this.loading = false
          if (this.#onSuccess !== undefined) this.#onSuccess(this.response)
        })
        .catch((error) => {
          this.response = error
          this.loading = false
          if (this.#onError !== undefined) this.#onError(this.response)
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
