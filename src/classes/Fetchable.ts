import { predicateFunction } from '../extracted'
import { Resolveable } from './Resolveable'

export type FetchableOptions = Record<never, never>

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
    return this.computedArrayBuffer
  }
  get blob () {
    return this.computedBlob
  }
  get formData () {
    return this.computedFormData
  }
  get json () {
    return this.computedJson
  }
  get text () {
    return this.computedText
  }

  private computedResource: string
  setResource (resource: string) {
    this.computedResource = resource
    return this
  }
  
  private computedResponse: Response
  private computedError: Error
  async fetch (options: FetchOptions = {}) {
    this.fetching()

    try {
      this.computedResponse = await fetch(this.resource, { signal: this.abortController.signal, ...narrowOptions(options) })
      this.fetched()
    } catch (error) {
      this.computedError = error as Error

      if (error.name === 'AbortError') this.aborted()
      else this.errored()
    }

    return this
  }
  private fetching () {
    this.computedStatus = 'fetching'
  }
  private fetched () {
    this.computedStatus = 'fetched'
  }
  private aborted () {
    this.computedStatus = 'aborted'
  }
  private errored () {
    this.computedStatus = 'errored'
  }
  async get (options: FetchOptions = {}) {
    await this.fetch({ signal: this.abortController.signal, ...narrowOptions(options), method: 'get' })
    return this
  }
  async patch (options: FetchOptions = {}) {
    await this.fetch({ signal: this.abortController.signal, ...narrowOptions(options), method: 'patch' })
    return this
  }
  async post (options: FetchOptions = {}) {
    await this.fetch({ signal: this.abortController.signal, ...narrowOptions(options), method: 'post' })
    return this
  }
  async put (options: FetchOptions = {}) {
    await this.fetch({ signal: this.abortController.signal, ...narrowOptions(options), method: 'put' })
    return this
  }
  async delete (options: FetchOptions = {}) {
    await this.fetch({ signal: this.abortController.signal, ...narrowOptions(options), method: 'delete' })
    return this
  }
  abort () {
    this.abortController.abort()
    return this
  }
}

function narrowOptions (options: RequestInit | ((api: FetchOptionsApi) => RequestInit)) {
  return predicateFunction(options)
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
      Accept: 'application/json' as const,
      'Content-Type': 'application/json' as const,
    },
  }
}
