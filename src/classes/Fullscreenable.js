/*
 * Fullscreenable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

 export default class Fullscreenable {
  constructor (getElement, options = {}) {
    this.setGetElement(getElement)
    this._computedError = {}
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

  async enter () {
    await this.fullscreen()
    return this
  }
  
  async fullscreen () {
    try {
      await this.element.requestFullscreen()
      this._fullscreened()
    } catch (error) {
      this._computedError = error
      this._fullscreenErrored()
    }

    return this
  }
  _fullscreened () {
    this._computedStatus = 'fullscreened'
  }
  _fullscreenErrored () {
    this._computedStatus = 'fullscreenErrored'
  }

  async exit () {
    try {
      await document.exitFullscreen()
      this._exited()
    } catch (error) {
      this._computedError = error
      this._exitErrored()
    }

    return this
  }
  _exited () {
    this._computedStatus = 'exited'
  }
  _exitErrored () {
    this._computedStatus = 'exitErrored'
  }
}
