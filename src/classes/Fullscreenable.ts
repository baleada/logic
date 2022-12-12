export type FullscreenableOptions = Record<never, never>

export type FullscreenableGetElement<ElementType> = ((...args: any[]) => ElementType)

export type FullscreenableStatus = 'ready' | 'fullscreened' | 'errored' | 'exited'

export class Fullscreenable<ElementType extends Element> {
  constructor (getElement: FullscreenableGetElement<ElementType>, options: FullscreenableOptions = {}) {
    this.setGetElement(getElement)
    this.ready()
  }
  private computedStatus: FullscreenableStatus
  private ready () {
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

  private computedGetElement: ((...args: any[]) => ElementType)
  setGetElement (getElement: ((...args: any[]) => ElementType)) {
    this.computedGetElement = () => getElement()
    return this
  }

  async enter (options: FullscreenOptions = {}) {
    await this.fullscreen(options)
    return this
  }
  
  private computedError: Error
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
  private fullscreened () {
    this.computedStatus = 'fullscreened'
  }
  private errored () {
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
  private exited () {
    this.computedStatus = 'exited'
  }
}
