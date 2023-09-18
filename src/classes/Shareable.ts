import { Resolveable } from './Resolveable'

export type ShareableOptions = Record<never, never>

export type ShareableStatus = 'ready' | 'sharing' | 'shared' | 'errored'

/**
 * [Docs](https://baleada.dev/docs/logic/classes/shareable)
 */
export class Shareable {
  constructor (shareData: ShareData, options: ShareableOptions = {}) {
    this.setShareData(shareData)
    this.ready()
  }
  private computedStatus: ShareableStatus
  private ready () {
    this.computedStatus = 'ready'
  }

  get shareData () {
    return this.computedState
  }
  set shareData (shareData) {
    this.setShareData(shareData)
  }
  get status () {
    return this.computedStatus
  }
  private computedCan: Resolveable<boolean>
  get can () {
    return this.computedCan
  }
  private computedError: Error
  get error () {
    return this.computedError
  }

  private computedState: ShareData
  setShareData (shareData: ShareData) {
    this.computedState = shareData
    this.computedCan = new Resolveable(async () => await navigator.canShare(shareData))
    return this
  }

  async share () {
    this.sharing()

    try {
      await navigator.share(this.shareData)
      this.shared()
    } catch (error) {
      this.computedError = error
      this.errored()
    }

    return this
  }
  private sharing () {
    this.computedStatus = 'sharing'
  }
  private shared () {
    this.computedStatus = 'shared'
  }
  private errored () {
    this.computedStatus = 'errored'
  }
}
