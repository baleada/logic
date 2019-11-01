/*
 * Fetchable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

/* Dependencies */

/* Util */
import emit from '../util/emit'

export default class Fetchable {
  /* Private properties */
  // _onFetch
  // _computedFetching
  // _computedResponseJson
  // _fetchOptions

  constructor (resource, options = {}) {
    /* Options */
    options = {
      onFetch: (newResponse, instance) => instance.setResponse(newResponse),
      ...options
    }

    this._onFetch = options.onFetch

    /* Public properties */
    this.resource = resource
    this.response = {}

    /* Private properties */
    this._computedFetching = false
    this._computedResponseJson = {}

    /* Dependency */
    this._fetchOptions = this._getFetchOptions(options)
  }

  /* Public getters */
  get fetching () {
    return this._computedFetching
  }
  get responseJson () {
    return this._computedResponseJson
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
  async fetch () {
    this._computedFetching = true
    const response = await fetch(this.resource, this._fetchOptions)
    this._computedFetching = false
    emit(this._onFetch, response, this)

    await this._setResponseJson(response)

    return this
  }
  async _setResponseJson (response) {
    try {
      this._computedResponseJson = await response.json()
    } catch (error) {
      this._computedResponseJson = error
    }
  }

  /* Private methods */
  _getFetchOptions = ({ onFetch, ...rest }) => ({ ...rest })
}
