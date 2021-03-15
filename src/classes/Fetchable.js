import Resolveable from './Resolveable.js'
import { isFunction } from '../util.js'

/**
 * 
 * @param {RequestInit | ((FetchOptionsApi) => RequestInit)} options 
 */
function ensureOptions (options) {
  return isFunction(options)
    ? options({ withJson })
    : options
}

/**
 * @typedef {{ withJson: (data: Record<any, any>) => { body: string, headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' } } }} FetchOptionsApi
 */

/**
 * @type {(data: Record<any, any>) => { body: string, headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' } }}
 */
function withJson (json) {
  return {
    body: JSON.stringify(json),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  }
}

export default class Fetchable {
  /**
   * @param {string} resource
   * @param {{}} [options]
   */
  constructor (resource, options = {}) {
    this.setResource(resource)

    this._computedArrayBuffer = new Resolveable(() => this.response.arrayBuffer())
    this._computedBlob = new Resolveable(() => this.response.blob())
    this._computedFormData = new Resolveable(() => this.response.formData())
    this._computedJson = new Resolveable(() => this.response.json())
    this._computedText = new Resolveable(() => this.response.text())

    this._ready()
  }
  _ready () {
    /**
     * @type {'ready' | 'fetching' | 'fetched' | 'aborted' | 'errored'}
     */
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

  /**
   * @template T
   * @param {Resolveable<T>} resolveable 
   */
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

  /**
   * @param {string} resource
   */
  setResource (resource) {
    this._computedResource = resource
    return this
  }
  /**
   * @param {Response} response 
   */
  _setResponse (response) {
    /**
     * @type {Response}
     */
    this._computedResponse = response
    return this
  }
  
  /**
   * @param {RequestInit} [options]
   */
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
  /**
   * @param {RequestInit} [options]
   */
  async get (options = {}) {
    options = {
      signal: this.abortController.signal,
      ...ensureOptions(options),
    }
    await this.fetch({ ...ensureOptions(options), method: 'get' })
    return this
  }
  /**
   * @param {RequestInit} [options]
   */
  async patch (options = {}) {
    options = {
      signal: this.abortController.signal,
      ...ensureOptions(options),
    }
    await this.fetch({ ...ensureOptions(options), method: 'patch' })
    return this
  }
  /**
   * @param {RequestInit} [options]
   */
  async post (options = {}) {
    options = {
      signal: this.abortController.signal,
      ...ensureOptions(options),
    }
    await this.fetch({ ...ensureOptions(options), method: 'post' })
    return this
  }
  /**
   * @param {RequestInit} [options]
   */
  async put (options = {}) {
    options = {
      signal: this.abortController.signal,
      ...ensureOptions(options),
    }
    await this.fetch({ ...ensureOptions(options), method: 'put' })
    return this
  }
  /**
   * @param {RequestInit} [options]
   */
  async delete (options = {}) {
    options = {
      signal: this.abortController.signal,
      ...ensureOptions(options),
    }
    await this.fetch({ ...ensureOptions(options), method: 'delete' })
    return this
  }
  abort () {
    this.abortController.abort()
    return this
  }
}
