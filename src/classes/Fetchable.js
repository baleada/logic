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
    this._computedStatus = {
      updatingResponseJson: true,
      fetching: false,
    }
    this._computedResponseJson = {}

    /* Dependency */
    this._fetchOptions = this._getFetchOptions(options)
  }

  _getFetchOptions = ({ onFetch, ...rest }) => ({ ...rest })

  /* Public getters */
  get status () {
    return this._computedStatus
  }
  get responseJson () {
    return this._computedResponseJson
  }

  async updateResponseJson () {
    try {
      this._computedStatus.updatingResponseJson = true
      this._computedResponseJson = await this.response.json()
      this._computedStatus.updatingResponseJson = false
    } catch (error) {
      this._computedResponseJson = error
      this._computedStatus.updatingResponseJson = false
    }

    return this
  }

  setResource (resource) {
    this.resource = resource
    return this
  }
  setResponse (response) {
    this.response = response
    this.updateResponseJson()
    return this
  }
  async fetch () {
    this._computedStatus.fetching = true
    const response = await fetch(this.resource, this._fetchOptions)
    this._computedStatus.fetching = false
    emit(this._onFetch, response, this)

    return this
  }
}
