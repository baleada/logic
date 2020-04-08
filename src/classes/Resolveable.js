/*
 * Resolveable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

 export default class Resolveable {
  constructor (promiseGetter, options = {}) {
    this.setPromiseGetter(promiseGetter)
    this._computedResponse = {}
    this._ready()
  }
  _ready () {
    this._computedStatus = 'ready'
  }

  get promiseGetter () {
    return this._computedPromiseGetter
  }
  set promiseGetter (promiseGetter) {
    this.setPromiseGetter(promiseGetter)
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

  setPromiseGetter (promiseGetter) {
    this._computedPromiseGetter = promiseGetter

    return this
  }
  
  async resolve () {
    this._computedStatus = 'resolving'
    let response
    try {
      response = await this.promiseGetter(...arguments)
      this._computedResponse = response
      this._computedStatus = 'resolved'
    } catch (error) {
      this._computedError = error
      this._computedStatus = 'errored'
    }
    
    return this
  }
}
