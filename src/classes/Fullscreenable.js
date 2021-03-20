export class Fullscreenable {
  /**
   * 
   * @param {(...args: any[]) => Element} getElement
   * @param {{}} [options]
   */
  constructor (getElement, options = {}) {
    this.setGetElement(getElement)
    this._ready()
  }
  _ready () {
    /**
     * @type {'ready' | 'fullscreened' | 'errored' | 'exited'}
     */
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

  /**
   * @param {(...args: any[]) => Element} getElement 
   */
  setGetElement (getElement) {
    this._computedGetElement = () => getElement()
    return this
  }

  /**
   * @param {FullscreenOptions} [options]
   */
  async enter (options = {}) {
    await this.fullscreen(options)
    return this
  }
  
  /**
   * @param {FullscreenOptions} [options]
   */
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
