import { createMapAsync } from '../pipes'
import { isArray } from '../util'

export type ResolveableOptions = {}

export class Resolveable<Value> {
  constructor (getPromise: (...args: any[]) => (Promise<Value> | Promise<Value>[]), options: ResolveableOptions = {}) {
    this.setGetPromise(getPromise)
    this._ready()
  }
  _computedStatus: 'ready' | 'resolving' | 'resolved' | 'errored'
  _ready () {
    this._computedStatus = 'ready'
  }

  get getPromise () {
    return this._computedGetPromise
  }
  set getPromise (getPromise) {
    this.setGetPromise(getPromise)
  }
  get status () {
    return this._computedStatus
  }
  get response () { 
    return this._computedResponse
  }

  _computedGetPromise: (...args: any[]) => (Promise<Value> | Promise<Value>[])
  setGetPromise (getPromise: (...args: any[]) => (Promise<Value> | Promise<Value>[])) {
    this._computedGetPromise = getPromise

    return this
  }
  

  _computedResponse: Value | Value[] | Error
  async resolve (...args: any[]) {
    this._resolving()
    try {
      const promises = this.getPromise(...args)

      this._computedResponse = isArray(promises)
        ? await createMapAsync<Promise<Value>, Value>(async promise => await promise)(promises)
        : await promises

      this._resolved()    
    } catch (error) {
      this._computedResponse = error as Error
      this._errored()    
    }
    
    return this
  }
  _resolving () {
    this._computedStatus = 'resolving'
  }
  _resolved () {
    this._computedStatus = 'resolved'
  }
  _errored () {
    this._computedStatus = 'errored'
  }
}
