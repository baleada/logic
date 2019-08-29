/*
 * Fetchable.js
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

/* Dependencies */

/* Utils */

export default class Fetchable {
  /* Private properties */
  #computedFetching
  #computedResponse
  #computedError
  #fetchOptions

  constructor(resource, options = {}) {
    /* Options */

    /* Public properties */
    this.resource = resource

    /* Private properties */
    this.#computedFetching = false
    this.#computedResponse = {}
    this.#computedError = {}

    /* Dependency */
    this.#fetchOptions = options
  }

  /* Public getters */
  get fetching() {
    return this.#computedFetching
  }
  get response() {
    return this.#computedResponse
  }
  get responseJson() {
    try {
      return this.response.json()
    } catch {
      return {}
    }
  }
  get error() {
    return this.#computedError
  }
  get errorJson() {
    try {
      return this.error.json()
    } catch {
      return {}
    }
  }

  /* Public methods */
  setResource(resource) {
    this.resource = resource
    return this
  }
  async fetch() {
    this.#computedFetching = true

    try {
      const response = await fetch(this.resource, this.#fetchOptions)
      this.#computedResponse = response
    } catch(error) {
      this.#computedError = error
    }

    return this
  }

  /* Private methods */
}
