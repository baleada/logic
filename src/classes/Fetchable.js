/*
 * Fetchable.js
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

/* Dependencies */

/* Util */
import emit from '../util/emit'

export default class Fetchable {
  /* Private properties */
  #onResolve
  #onReject
  #computedFetching
  #fetchOptions

  constructor (resource, options = {}) {
    /* Options */
    options = {
      onResolve: (newResponse, instance) => instance.setResponse(newResponse),
      onReject: (newError, instance) => instance.setError(newError),
      ...options
    }

    this.#onResolve = options.onResolve
    this.#onReject = options.onReject

    /* Public properties */
    this.resource = resource
    this.response = {}
    this.error = {}

    /* Private properties */
    this.#computedFetching = false

    /* Dependency */
    this.#fetchOptions = this.#getFetchOptions(options)
  }

  /* Public getters */
  get fetching () {
    return this.#computedFetching
  }
  get responseJson () {
    try {
      return this.response.json()
    } catch {
      return {}
    }
  }
  get errorJson () {
    try {
      return this.error.json()
    } catch {
      return {}
    }
  }

  /* Public methods */
  setResource (resource) {
    this.resource = resource
    return this
  }
  setResponse (response) {
    this.response = response
    return this
  }
  setError (error) {
    this.error = error
    return this
  }
  fetch () {
    this.#computedFetching = true

    return fetch(this.resource, this.#fetchOptions)
      .then(response => {
        emit(this.#onResolve, response, this)
      })
      .catch(error => {
        emit(this.#onReject, error, this)
      })
      .finally(() => {
        this.#computedFetching = false
        return this
      })
  }

  /* Private methods */
  #getFetchOptions = ({ onResolve, onReject, ...rest }) => ({ ...rest })
}
