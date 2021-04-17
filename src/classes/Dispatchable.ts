import { toEvent, toCombo } from '../util'

export type DispatchableOptions = {}

export class Dispatchable {
  constructor (type: string, options: DispatchableOptions = {}) {
    this.setType(type)
    this._ready()
  }
  _computedStatus: 'ready' | 'dispatched'
  _ready () {
    this._computedStatus = 'ready'
  }

  get type () {
    return this._computedType
  }
  set type (type) {
    this.setType(type)
  }
  get cancelled () {
    return this._computedCancelled
  }
  get status () {
    return this._computedStatus
  }

  _computedType: string
  setType (type) {
    this._computedType = type
    return this
  }

  _computedCancelled: boolean
  dispatch (
    options: {
      target?: Window & typeof globalThis | Document | Element,
      keyDirection?: 'up' | 'down',
      init?: EventInit
    } = {}
  ) {
    const { target = window, keyDirection = 'down', init = {} } = options,
          event = toEvent(toCombo(this.type), { keyDirection: keyDirection, init })

    this._computedCancelled = !target.dispatchEvent(event)
    this._dispatched()

    return this
  }
  _dispatched () {
    this._computedStatus = 'dispatched'
  }
}
