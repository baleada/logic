import { toEvent, toCombo } from '../extracted'
import type { ListenableKeycombo, ListenableSupportedEventType } from './Listenable'

export type DispatchableOptions = {}

export type DispatchableStatus = 'ready' | 'dispatched'

export type DispatchOptions<EventType extends ListenableSupportedEventType> = EventType extends ListenableKeycombo 
  ? { keyDirection?: 'up' | 'down' } & EventDispatchOptions
  : EventDispatchOptions

type EventDispatchOptions = {
  init?: EventInit,
  target?: Window & typeof globalThis | Document | Element
}

export class Dispatchable<Type extends ListenableSupportedEventType> {
  constructor (type: Type, options: DispatchableOptions = {}) {
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
  dispatch (options: DispatchOptions<Type> = {}) {
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
