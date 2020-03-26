/*
 * Fullscreenable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

 export default class Fullscreenable {
  constructor (elementGetter, options = {}) {
    this.setElementGetter(elementGetter)
    this._computedError = {}
    this._ready()
  }
  _ready () {
    this._computedStatus = 'ready'
  }

  get elementGetter () {
    return this._computedResource
  }
  set elementGetter (elementGetter) {
    this.setElementGetter(elementGetter)
  }
  get status () {
    return this._computedStatus
  }
  get element () {
    return this.elementGetter()
  }
  get error () {
    return this._computedError
  }

  setElementGetter (elementGetter) {
    this._computedResource = () => elementGetter()
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
    this._computedStatus = '_fullscreenErrored'
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
    this._computedStatus = '_exitErrored'
  }
}
