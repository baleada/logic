export type FullscreenableOptions = Record<string, never>

export type FullscreenableGetElement<ElementType> = ((...args: any[]) => ElementType)

export type FullscreenableStatus = 'ready' | 'fullscreened' | 'errored' | 'exited'

export class Fullscreenable<ElementType extends Element> {
  constructor (getElement: FullscreenableGetElement<ElementType>, options: FullscreenableOptions = {}) {
    this.setGetElement(getElement)
    this._ready()
  }
  _computedStatus: FullscreenableStatus
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

  _computedGetElement: ((...args: any[]) => ElementType)
  setGetElement (getElement: ((...args: any[]) => ElementType)) {
    this._computedGetElement = () => getElement()
    return this
  }

  async enter (options: FullscreenOptions = {}) {
    await this.fullscreen(options)
    return this
  }
  
  _computedError: Error
  async fullscreen (options: FullscreenOptions = {}) {
    try {
      await this.element.requestFullscreen(options)
      this._fullscreened()
    } catch (error) {
      this._computedError = error as Error
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
