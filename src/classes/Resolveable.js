/*
 * Resolveable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

 export default class Resolveable {
  constructor (getPromise, options = {}) {
    this.setGetPromise(getPromise)
    this._ready()
  }
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

  setGetPromise (getPromise) {
    this._computedGetPromise = getPromise

    return this
  }
  
  async resolve () {
    this._resolving()
    try {
      const promises = await this.getPromise(...arguments)

      this._computedResponse = Array.isArray(promises)
        ? await promises.reduce(async (promises, promise) => [...(await promises), await promise], Promise.resolve([]))
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
