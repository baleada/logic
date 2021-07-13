import { toEvent, toCombo } from '../extracted'
import type { ListenableSupportedEvent } from './Listenable'

export type DispatchableOptions = {}

export type DispatchableStatus = 'ready' | 'dispatched'

export type DispatchOptions<EventType extends ListenableSupportedEvent> = EventType extends KeyboardEvent 
  ? { keyDirection?: 'up' | 'down' } & EventDispatchOptions
  : EventDispatchOptions

type EventDispatchOptions = {
  init?: EventInit,
  target?: Window & typeof globalThis | Document | Element
}

export class Dispatchable<EventType extends ListenableSupportedEvent> {
  constructor (type: string, options: DispatchableOptions = {}) {
    this.setType(type)
    this._ready()
  }
  _computedStatus: DispatchableStatus
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
  dispatch (options: DispatchOptions<EventType> = {}) {
    const { target = window, ...rest } = options,
          event = toEvent(toCombo(this.type), rest)

    this._computedCancelled = !target.dispatchEvent(event)
    this._dispatched()

    return this
  }
  _dispatched () {
    this._computedStatus = 'dispatched'
  }
}
