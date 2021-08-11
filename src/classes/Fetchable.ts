import { Resolveable } from './Resolveable'
import { isFunction } from '../extracted'

export type FetchableOptions = Record<string, never>

export type FetchableStatus = 'ready' | 'fetching' | 'fetched' | 'aborted' | 'errored'

export type FetchOptions = RequestInit | ((api: FetchOptionsApi) => RequestInit)

export class Fetchable {
  private computedArrayBuffer: Resolveable<ArrayBuffer | undefined>
  private computedBlob: Resolveable<Blob | undefined>
  private computedFormData: Resolveable<FormData | undefined>
  private computedJson: Resolveable<any | undefined>
  private computedText: Resolveable<string | undefined>
  constructor (resource: string, options: FetchableOptions = {}) {
    this.setResource(resource)

    this.computedArrayBuffer = new Resolveable(async () => 'arrayBuffer' in this.response ? await this.response.arrayBuffer() : await undefined)
    this.computedBlob =        new Resolveable(async () => 'blob'        in this.response ? await this.response.blob()        : await undefined)
    this.computedFormData =    new Resolveable(async () => 'formData'    in this.response ? await this.response.formData()    : await undefined)
    this.computedJson =        new Resolveable(async () => 'json'        in this.response ? await this.response.json()        : await undefined)
    this.computedText =        new Resolveable(async () => 'text'        in this.response ? await this.response.text()        : await undefined)

    this.ready()
  }
  private computedStatus: FetchableStatus
  private ready () {
    this.computedStatus = 'ready'
  }

  get resource () {
    return this.computedResource
  }
  set resource (resource) {
    this.setResource(resource)
  }
  private computedAbortController: AbortController
  get abortController () {
    if (!this.computedAbortController) {
      this.computedAbortController = new AbortController()
    }

    return this.computedAbortController
  }
  get status () {
    return this.computedStatus
  }
  get response () { 
    return this.computedResponse
  }
  get error () { 
    return this.computedError
  }
  get arrayBuffer () {
    return this.getUsedBody(this.computedArrayBuffer)
  }
  get blob () {
    return this.getUsedBody(this.computedBlob)
  }
  get formData () {
    return this.getUsedBody(this.computedFormData)
  }
  get json () {
    return this.getUsedBody(this.computedJson)
  }
  get text () {
    return this.getUsedBody(this.computedText)
  }

  private getUsedBody<Value> (resolveable: Resolveable<Value>) {
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

  private computedResource: string
  setResource (resource: string) {
    this.computedResource = resource
    return this
  }
  
  private computedResponse: Response
  private computedError: Error
  async fetch (options: FetchOptions = {}) {
    this.computedStatus = 'fetching'

    try {
      this.computedResponse = await fetch(this.resource, { signal: this.abortController.signal, ...ensureOptions(options) })
      this.computedStatus = 'fetched'
    } catch (error) {
      this.computedError = error as Error

      this.computedStatus = error.name === 'AbortError'
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
