import ky from 'ky'
import type { Options as KyOptions } from 'ky'
import { predicateFunction } from '../extracted'
import { Resolveable } from './Resolveable'

export type FetchableOptions = {
  ky?: KyOptions | ((api: ToKyOptionsApi) => KyOptions)
}

type ToKyOptionsApi = {
  stop: typeof ky['stop'],
}

export type FetchableStatus = 'ready' | 'fetching' | 'fetched' | 'retrying' | 'aborted' | 'errored'

export type FetchOptions = Omit<KyOptions, 'signal'>

export type FetchMethodOptions = Omit<FetchOptions, 'method'>

/**
 * [Docs](https://baleada.dev/docs/logic/classes/fetchable)
 */
export class Fetchable<ResolveableValue> {
  private computedArrayBuffer: Resolveable<ArrayBuffer | undefined>
  private computedBlob: Resolveable<Blob | undefined>
  private computedFormData: Resolveable<FormData | undefined>
  private computedJson: Resolveable<ResolveableValue | undefined>
  private computedText: Resolveable<string | undefined>
  constructor (resource: string, options: FetchableOptions = {}) {
    this.setResource(resource)

    this.computedKy = ky.create(narrowOptions(options.ky))

    this.computedArrayBuffer = new Resolveable(async () => 'arrayBuffer' in this.response ? await this.response.arrayBuffer() : undefined)
    this.computedBlob =        new Resolveable(async () => 'blob'        in this.response ? await this.response.blob()        : undefined)
    this.computedFormData =    new Resolveable(async () => 'formData'    in this.response ? await this.response.formData()    : undefined)
    this.computedJson =        new Resolveable(async () => 'json'        in this.response ? await this.response.json()        : undefined)
    this.computedText =        new Resolveable(async () => 'text'        in this.response ? await this.response.text()        : undefined)

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
  get status () {
    return this.computedStatus
  }
  private computedKy: ReturnType<typeof ky['create']>
  get ky () {
    return this.computedKy
  }
  private computedAbortController: AbortController
  get abortController () {
    if (!this.computedAbortController) this.computedAbortController = new AbortController()
    return this.computedAbortController
  }
  private computedRetryCount: number = 0
  get retryCount () {
    return this.computedRetryCount
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
      this.computedResponse = await this.ky(
        this.resource,
        {
          ...options,
          signal: this.abortController.signal,
          hooks: {
            ...options.hooks,
            beforeRetry: [
              ...options.hooks?.beforeRetry || [],
              ({ retryCount }) => {
                this.retrying()
                this.computedRetryCount = retryCount
              },
            ],
          },
        }
      )

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
  private retrying () {
    this.computedStatus = 'retrying'
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
  async get (options: FetchMethodOptions = {}) {
    await this.fetch({ ...options, method: 'get' })
    return this
  }
  async patch (options: FetchMethodOptions = {}) {
    await this.fetch({ ...options, method: 'patch' })
    return this
  }
  async post (options: FetchMethodOptions = {}) {
    await this.fetch({ ...options, method: 'post' })
    return this
  }
  async put (options: FetchMethodOptions = {}) {
    await this.fetch({ ...options, method: 'put' })
    return this
  }
  async delete (options: FetchMethodOptions = {}) {
    await this.fetch({ ...options, method: 'delete' })
    return this
  }
  async head (options: FetchMethodOptions = {}) {
    await this.fetch({ ...options, method: 'head' })
    return this
  }
  abort () {
    this.abortController.abort()
    return this
  }
}

function narrowOptions (options: FetchableOptions['ky']): KyOptions {
  if (!options) return {}

  return predicateFunction(options)
    ? options({ stop: ky.stop })
    : options
}
