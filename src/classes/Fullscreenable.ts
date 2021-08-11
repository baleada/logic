export type FullscreenableOptions = Record<string, never>

export type FullscreenableGetElement<ElementType> = ((...args: any[]) => ElementType)

export type FullscreenableStatus = 'ready' | 'fullscreened' | 'errored' | 'exited'

export class Fullscreenable<ElementType extends Element> {
  constructor (getElement: FullscreenableGetElement<ElementType>, options: FullscreenableOptions = {}) {
    this.setGetElement(getElement)
    this.ready()
  }
  computedStatus: FullscreenableStatus
  ready () {
    this.computedStatus = 'ready'
  }

  get getElement () {
    return this.computedGetElement
  }
  set getElement (getElement) {
    this.setGetElement(getElement)
  }
  get status () {
    return this.computedStatus
  }
  get element () {
    return this.getElement()
  }
  get error () {
    return this.computedError
  }

  computedGetElement: ((...args: any[]) => ElementType)
  setGetElement (getElement: ((...args: any[]) => ElementType)) {
    this.computedGetElement = () => getElement()
    return this
  }

  async enter (options: FullscreenOptions = {}) {
    await this.fullscreen(options)
    return this
  }
  
  computedError: Error
  async fullscreen (options: FullscreenOptions = {}) {
    try {
      await this.element.requestFullscreen(options)
      this.fullscreened()
    } catch (error) {
      this.computedError = error as Error
      this.errored()
    }

    return this
  }
  fullscreened () {
    this.computedStatus = 'fullscreened'
  }
  errored () {
    this.computedStatus = 'errored'
  }

  async exit () {
    try {
      await document.exitFullscreen()
      this.exited()
    } catch (error) {
      this.computedError = error
      this.errored()
    }

    return this
  }
  exited () {
    this.computedStatus = 'exited'
  }
}
