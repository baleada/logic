import { createMapAsync } from '../pipes.js'
import { isArray } from '../util.js'

export default class Resolveable {
  /**
   * 
   * @param {(...args: any[]) => (Promise<any> | Promise<any>[])} getPromise 
   * @param {{}} [options] 
   */
  constructor (getPromise, options = {}) {
    this.setGetPromise(getPromise)
    this._ready()
  }
  _ready () {
    /**
     * @type {'ready' | 'resolving' | 'resolved' | 'errored'}
     */
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

  /**
   * @param {(...args: any[]) => (Promise<any> | Promise<any>[])} getPromise 
   */
  setGetPromise (getPromise) {
    this._computedGetPromise = getPromise

    return this
  }
  
  /**
   * @type {(...args: any[]) => Promise<this>}
   */
  async resolve () {
    this._resolving()
    try {
      const promises = this.getPromise(...arguments)

      this._computedResponse = isArray(promises)
        ? await createMapAsync(async promise => await promise)(promises)
        : await promises

      this._resolved()    
    } catch (error) {
      this._computedResponse = error
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
