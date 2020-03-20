/*
 * Fetchable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

export default class Fetchable {
  constructor (resource, options = {}) {
    this.setResource(resource)
    this._computedResponse = {}
    this._computedResponseJson = {}
    this._ready()
  }
  _ready () {
    this._computedStatus = {
      response: 'ready',
      responseJson: 'ready',
    }
  }

  get resource () {
    return this._computedResource
  }
  set resource (resource) {
    this.setResource(resource)
  }
  get status () {
    return this._computedStatus
  }
  get response () { 
    return this._computedResponse
  }
  get responseJson () {
    return this._computedResponseJson
  }

  async _updateResponseJson () {
    try {
      this._computedStatus.responseJson = 'updating'
      this._computedResponseJson = await this.response.json()
      this._computedStatus.responseJson = 'updated'
    } catch (error) {
      this._computedResponseJson = error
      this._computedStatus.responseJson = 'errored'
    }

    return this
  }

  setResource (resource) {
    this._computedResource = resource
    return this
  }
  _setResponse (response) {
    this._computedResponse = response
    this._updateResponseJson()
    return this
  }
  
  async fetch (options) {
    this._computedStatus.response = 'fetching'
    const response = await fetch(this.resource, options)
    this._computedStatus.response = 'fetched'
    this._setResponse(response)

    return this
  }
}
