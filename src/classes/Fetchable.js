/**
* Fetchable.js
* (c) 2019-present Alex Vipond
* Released under the MIT license
**/

import { is } from '../util'

function resolveOptions (options) {
  return is.function(options)
    ? options({ withJson })
    : options
}

function withJson (data) {
  return {
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  }
}

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
    options = resolveOptions(options)
    this._computedStatus.response = 'fetching'
    const response = await fetch(this.resource, options)
    this._computedStatus.response = 'fetched'
    this._setResponse(response)

    return this
  }
  async get (options = {}) {
    await this.fetch({ ...options, method: 'get' })
    return this
  }
  async patch (options = {}) {
    await this.fetch({ ...options, method: 'patch' })
    return this
  }
  async post (options = {}) {
    await this.fetch({ ...options, method: 'post' })
    return this
  }
  async put (options = {}) {
    await this.fetch({ ...options, method: 'put' })
    return this
  }
  async delete (options = {}) {
    await this.fetch({ ...options, method: 'delete' })
    return this
  }
}
