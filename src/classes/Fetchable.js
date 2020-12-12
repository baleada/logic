/**
* Fetchable.js
* (c) 2019-present Alex Vipond
* Released under the MIT license
**/

import Resolveable from './Resolveable'

import { isFunction } from '../util'

function ensureOptions (options) {
  return isFunction(options)
    ? options({ withJson })
    : options
}

function withJson (data) {
  return {
    body: JSON.stringify(data),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  }
}

export default class Fetchable {
  constructor (resource, options = {}) {
    this.setResource(resource)
    this._computedResponse = {}

    this._computedArrayBuffer = new Resolveable(() => this.response.arrayBuffer())
    this._computedBlob = new Resolveable(() => this.response.blob())
    this._computedFormData = new Resolveable(() => this.response.formData())
    this._computedJson = new Resolveable(() => this.response.json())
    this._computedText = new Resolveable(() => this.response.text())

    this._ready()
  }
  _ready () {
    this._computedStatus = 'ready'
  }

  get resource () {
    return this._computedResource
  }
  set resource (resource) {
    this.setResource(resource)
  }
  get abortController () {
    if (!this._computedAbortController) {
      this._computedAbortController = new AbortController()
    }

    return this._computedAbortController
  }
  get status () {
    return this._computedStatus
  }
  get response () { 
    return this._computedResponse
  }
  get arrayBuffer () {
    return this._getUsedBody(this._computedArrayBuffer)
  }
  get blob () {
    return this._getUsedBody(this._computedBlob)
  }
  get formData () {
    return this._getUsedBody(this._computedFormData)
  }
  get json () {
    return this._getUsedBody(this._computedJson)
  }
  get text () {
    return this._getUsedBody(this._computedText)
  }

  _getUsedBody (resolveable) {
    if (!this.response.bodyUsed) {
      return resolveable.resolve()
    } else {
      switch (resolveable.status) {
      case 'ready':
        // Unreachable state
        break
      case 'resolving':
        // warn?
        break
      case 'resolved':
      case 'errored':
        return resolveable
      }
    }
  }

  setResource (resource) {
    this._computedResource = resource
    return this
  }
  _setResponse (response) {
    this._computedResponse = response
    return this
  }
  
  async fetch (options) {
    options = {
      signal: this.abortController.signal,
      ...ensureOptions(options),
    }

    this._computedStatus = 'fetching'

    try {
      this._computedResponse = await fetch(this.resource, options)
      this._computedStatus = 'fetched'
    } catch (error) {
      this._computedResponse = error

      this._computedStatus = error.name === 'AbortError'
        ? 'aborted'
        : 'errored'
    }

    return this
  }
  async get (options = {}) {
    options = {
      signal: this.abortController.signal,
      ...ensureOptions(options),
    }
    await this.fetch({ ...options, method: 'get' })
    return this
  }
  async patch (options = {}) {
    options = {
      signal: this.abortController.signal,
      ...ensureOptions(options),
    }
    await this.fetch({ ...options, method: 'patch' })
    return this
  }
  async post (options = {}) {
    options = {
      signal: this.abortController.signal,
      ...ensureOptions(options),
    }
    await this.fetch({ ...options, method: 'post' })
    return this
  }
  async put (options = {}) {
    options = {
      signal: this.abortController.signal,
      ...ensureOptions(options),
    }
    await this.fetch({ ...options, method: 'put' })
    return this
  }
  async delete (options = {}) {
    options = {
      signal: this.abortController.signal,
      ...ensureOptions(options),
    }
    await this.fetch({ ...options, method: 'delete' })
    return this
  }
  abort () {
    this.abortController.abort()
    return this
  }
}
