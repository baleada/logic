/*
 * Resolveable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

 export default class Resolveable {
  constructor (getPromise, options = {}) {
    this.setGetPromise(getPromise)
    this._computedResponse = {}
    this._computedError = {}
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
  get error () {
    return this._computedError
  }

  setGetPromise (getPromise) {
    this._computedGetPromise = getPromise

    return this
  }
  
  async resolve () {
    this._computedStatus = 'resolving'
    let response
    try {
      response = await this.getPromise(...arguments)
      this._computedResponse = response
      this._computedStatus = 'resolved'
    } catch (error) {
      this._computedError = error
      this._computedStatus = 'errored'
    }
    
    return this
  }
}
