import { toEvent, toCombo } from '../extracted'
import type { ListenableKeycombo, ListenableSupportedEventType } from './Listenable'

export type DispatchableOptions = Record<string, never>

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
    this.ready()
  }
  private computedStatus: DispatchableStatus
  private ready () {
    this.computedStatus = 'ready'
  }

  get type () {
    return this.computedType
  }
  set type (type) {
    this.setType(type)
  }
  get cancelled () {
    return this.computedCancelled
  }
  get status () {
    return this.computedStatus
  }

  private computedType: string
  setType (type) {
    this.computedType = type
    return this
  }

  private computedCancelled: boolean
  dispatch (options: DispatchOptions<Type> = {}) {
    const { target = window, ...rest } = options,
          event = toEvent(toCombo(this.type), rest)

    this.computedCancelled = !target.dispatchEvent(event)
    this.dispatched()

    return this
  }
  private dispatched () {
    this.computedStatus = 'dispatched'
  }
}
