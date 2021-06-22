import { Resolveable } from './Resolveable'
import { isFunction } from '../util'

export type FetchableOptions = {}

export type FetchableStatus = 'ready' | 'fetching' | 'fetched' | 'aborted' | 'errored'

export type FetchOptions = RequestInit | ((api: FetchOptionsApi) => RequestInit)

export class Fetchable {
  _computedArrayBuffer: Resolveable<ArrayBuffer | undefined>
  _computedBlob: Resolveable<Blob | undefined>
  _computedFormData: Resolveable<FormData | undefined>
  _computedJson: Resolveable<any | undefined>
  _computedText: Resolveable<string | undefined>
  constructor (resource: string, options: FetchableOptions = {}) {
    this.setResource(resource)

    this._computedArrayBuffer = new Resolveable(async () => 'arrayBuffer' in this.response ? await this.response.arrayBuffer() : await undefined)
    this._computedBlob =        new Resolveable(async () => 'blob'        in this.response ? await this.response.blob()        : await undefined)
    this._computedFormData =    new Resolveable(async () => 'formData'    in this.response ? await this.response.formData()    : await undefined)
    this._computedJson =        new Resolveable(async () => 'json'        in this.response ? await this.response.json()        : await undefined)
    this._computedText =        new Resolveable(async () => 'text'        in this.response ? await this.response.text()        : await undefined)

    this._ready()
  }
  _computedStatus: FetchableStatus
  _ready () {
    this._computedStatus = 'ready'
  }

  get resource () {
    return this._computedResource
  }
  set resource (resource) {
    this.setResource(resource)
  }
  _computedAbortController: AbortController
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

  _getUsedBody<Value> (resolveable: Resolveable<Value>) {
    const bodyUsed = 'bodyUsed' in this.response ? this.response.bodyUsed : false
    
    if (!bodyUsed) {
      return resolveable.resolve()
    }
    
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

  _computedResource: string
  setResource (resource: string) {
    this._computedResource = resource
    return this
  }
  
  _computedResponse: Response | Error
  async fetch (options: FetchOptions = {}) {
    this._computedStatus = 'fetching'

    try {
      this._computedResponse = await fetch(this.resource, { signal: this.abortController.signal, ...ensureOptions(options) })
      this._computedStatus = 'fetched'
    } catch (error) {
      this._computedResponse = error as Error

      this._computedStatus = error.name === 'AbortError'
        ? 'aborted'
        : 'errored'
    }

    return this
  }
  async get (options: FetchOptions = {}) {
    await this.fetch({ signal: this.abortController.signal, ...ensureOptions(options), method: 'get' })
    return this
  }
  async patch (options: FetchOptions = {}) {
    await this.fetch({ signal: this.abortController.signal, ...ensureOptions(options), method: 'patch' })
    return this
  }
  async post (options: FetchOptions = {}) {
    await this.fetch({ signal: this.abortController.signal, ...ensureOptions(options), method: 'post' })
    return this
  }
  async put (options: FetchOptions = {}) {
    await this.fetch({ signal: this.abortController.signal, ...ensureOptions(options), method: 'put' })
    return this
  }
  async delete (options: FetchOptions = {}) {
    await this.fetch({ signal: this.abortController.signal, ...ensureOptions(options), method: 'delete' })
    return this
  }
  abort () {
    this.abortController.abort()
    return this
  }
}

function ensureOptions (options: RequestInit | ((api: FetchOptionsApi) => RequestInit)) {
  return isFunction(options)
    ? options({ withJson })
    : options
}

export type FetchOptionsApi = {
  withJson: (data: Record<any, any>) => {
    body: string,
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
  }
}

function withJson (data: Record<any, any>) {
  return {
    body: JSON.stringify(data),
    headers: {
      'Accept': 'application/json' as const,
      'Content-Type': 'application/json' as const,
    },
  }
}
