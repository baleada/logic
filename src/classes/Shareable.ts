import { Resolveable } from "./Resolveable"

export type ShareableOptions = Record<never, never>

export type ShareableStatus = 'ready' | 'sharing' | 'shared' | 'errored'

export class Shareable {
  constructor (state: ShareData, options: ShareableOptions = {}) {
    this.setState(state)
    this.ready()
  }
  private computedStatus: ShareableStatus
  private ready () {
    this.computedStatus = 'ready'
  }

  get state () {
    return this.computedState
  }
  set state (state) {
    this.setState(state)
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
  setState (state: ShareData) {
    this.computedState = state
    this.computedCan = new Resolveable(async () => await navigator.canShare(state))
    return this
  }

  async share () {
    this.sharing()

    try {
      await navigator.share(this.state)
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
