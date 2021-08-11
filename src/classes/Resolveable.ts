import { createMapAsync } from '../pipes'
import { isArray } from '../extracted'

export type ResolveableOptions = Record<string, never>

export type ResolveableGetPromise<Value> = (...args: any[]) => (Promise<Value> | Promise<Value>[])

export type ResolveableStatus = 'ready' | 'resolving' | 'resolved' | 'errored'

export class Resolveable<Value> {
  constructor (getPromise: ResolveableGetPromise<Value>, options: ResolveableOptions = {}) {
    this.setGetPromise(getPromise)
    this.ready()
  }
  private computedStatus: ResolveableStatus
  private ready () {
    this.computedStatus = 'ready'
  }

  get getPromise () {
    return this.computedGetPromise
  }
  set getPromise (getPromise) {
    this.setGetPromise(getPromise)
  }
  get status () {
    return this.computedStatus
  }
  get response () { 
    return this.computedResponse
  }

  private computedGetPromise: (...args: any[]) => (Promise<Value> | Promise<Value>[])
  setGetPromise (getPromise: (...args: any[]) => (Promise<Value> | Promise<Value>[])) {
    this.computedGetPromise = getPromise

    return this
  }
  

  private computedResponse: Value | Value[] | Error
  async resolve (...args: any[]) {
    this.resolving()
    try {
      const promises = this.getPromise(...args)

      this.computedResponse = isArray(promises)
        ? await createMapAsync<Promise<Value>, Value>(async promise => await promise)(promises)
        : await promises

      this.resolved()    
    } catch (error) {
      this.computedResponse = error as Error
      this.errored()    
    }
    
    return this
  }
  private resolving () {
    this.computedStatus = 'resolving'
  }
  private resolved () {
    this.computedStatus = 'resolved'
  }
  private errored () {
    this.computedStatus = 'errored'
  }
}
