/*
 * Fullscreenable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

 export default class Fullscreenable {
  constructor (getElement, options = {}) {
    this.setGetElement(getElement)
    this._ready()
  }
  _ready () {
    this._computedStatus = 'ready'
  }

  get getElement () {
    return this._computedGetElement
  }
  set getElement (getElement) {
    this.setGetElement(getElement)
  }
  get status () {
    return this._computedStatus
  }
  get element () {
    return this.getElement()
  }
  get error () {
    return this._computedError
  }

  setGetElement (getElement) {
    this._computedGetElement = () => getElement()
    return this
  }

  async enter (options = {}) {
    await this.fullscreen(options)
    return this
  }
  
  async fullscreen (options = {}) {
    try {
      await this.element.requestFullscreen(options)
      this._fullscreened()
    } catch (error) {
      this._computedError = error
      this._errored()
    }

    return this
  }
  _fullscreened () {
    this._computedStatus = 'fullscreened'
  }
  _errored () {
    this._computedStatus = 'errored'
  }

  async exit () {
    try {
      await document.exitFullscreen()
      this._exited()
    } catch (error) {
      this._computedError = error
      this._errored()
    }

    return this
  }
  _exited () {
    this._computedStatus = 'exited'
  }
}
