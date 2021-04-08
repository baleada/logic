import { Recognizeable } from './Recognizeable'
import type { RecognizeableOptions } from './Recognizeable'
import {
  toObserver,
  toCategory,
  toCombo,
  comboItemNameToType,
  toAddEventListenerParams,
  eventMatchesKeycombo,
  eventMatchesClickcombo,
  ListenableCategory,
} from '../util.js'

type ListenableSupportedType = IntersectionObserverEntry | MutationRecord | ResizeObserverEntry | MediaQueryListEvent | IdleDeadline | KeyboardEvent | MouseEvent | CustomEvent | Event
type ListenableSupportedObservation = IntersectionObserverEntry | MutationRecord | ResizeObserverEntry

type ListenableOptions<EventType> = { recognizeable?: RecognizeableOptions<EventType> }

export type ListenCallback<EventType> = 
  EventType extends IntersectionObserverEntry ? IntersectionObserverCallback :
  EventType extends MutationRecord ? MutationCallback :
  EventType extends ResizeObserverEntry ? ResizeObserverCallback :
  EventType extends IdleDeadline ? IdleRequestCallback :
  EventType extends MediaQueryListEvent | KeyboardEvent | MouseEvent | CustomEvent | Event ? (event: EventType) => any :
  () => void

export type ListenOptions<EventType> = 
  EventType extends IntersectionObserverEntry ? { observer?: IntersectionObserverInit } & ObservationListenOptions :
  EventType extends MutationRecord ? { observe?: MutationObserverInit } & ObservationListenOptions :
  EventType extends ResizeObserverEntry ? { observe?: ResizeObserverOptions } & ObservationListenOptions :
  EventType extends MediaQueryListEvent ? {} :
  EventType extends IdleDeadline ? { requestIdleCallback?: IdleRequestOptions } :
  EventType extends KeyboardEvent ? { comboDelimiter?: string, keyDirection?: 'up' | 'down' } & EventListenOptions :
  EventType extends MouseEvent ? { comboDelimiter?: string } & EventListenOptions :
  EventType extends CustomEvent | Event ? EventListenOptions :
  {}

type ObservationListenOptions = { target?: Element }

type EventListenOptions = {
  target?: Element | Document | Window
  addEventListener?: AddEventListenerOptions,
  useCapture?: boolean,
  wantsUntrusted?: boolean,
  except?: string[],
  only?: string[],
}

type ListenableActive<EventType> = { category: ListenableCategory } & (
  EventType extends IntersectionObserverEntry ? { target: Element, id: IntersectionObserver } :
  EventType extends MutationRecord ? { target: Element, id: MutationObserver } :
  EventType extends ResizeObserverEntry ? { target: Element, id: ResizeObserver } :
  EventType extends MediaQueryListEvent ? { target: MediaQueryList, id: [type: string, listener: ListenCallback<EventType>] } :
  EventType extends IdleDeadline ? { target: Window, id: number } :
  EventType extends KeyboardEvent | MouseEvent | CustomEvent ? { target: Element | Document, id: ListenableActiveEventId<EventType> } :
  {}
)

type ListenableActiveEventId<EventType> = [
  type: string,
  exceptAndOnlyListener: ListenCallback<EventType>,
  optionsOrUseCapture: AddEventListenerOptions | boolean,
  wantsUntrusted: boolean
]

export class Listenable<EventType extends ListenableSupportedType> {
  _computedRecognizeable: Recognizeable<EventType>
  _computedRecognizeableEvents: string[]
  _computedActive: Set<ListenableActive<EventType>> // TODO: better type
  constructor (type: string, options: ListenableOptions<EventType> = {}) {
    if (type === 'recognizeable') {
      this._computedRecognizeable = new Recognizeable([], options.recognizeable)
      this._computedRecognizeableEvents = Object.keys(options.recognizeable?.handlers || {})
    }    

    this._computedActive = new Set()

    this.setType(type)
    this._ready()
  }
  _computedStatus: 'ready' | 'listening' | 'stopped'
  _ready () {
    this._computedStatus = 'ready'
  }

  get type () {
    return this._computedType
  }
  set type (type) {
    this.setType(type)
  }
  get status () {
    return this._computedStatus
  }
  get active () {
    return this._computedActive
  }
  get recognizeable () {
    return this._computedRecognizeable
  }

  _computedType: string
  _computedCategory: ListenableCategory
  setType (type: string) {
    this.stop()
    this._computedType = type
    this._computedCategory = toCategory(type)
    return this
  }

  listen (listener: ListenCallback<EventType>, options?: ListenOptions<EventType>) {
    switch (this._computedCategory) {
      case 'observation':
        this._observationListen(listener as ListenCallback<ListenableSupportedObservation>, options as ListenOptions<ListenableSupportedObservation>)
        break
      case 'mediaquery':
        this._mediaQueryListen(listener as (event: MediaQueryListEvent) => any)
        break
      case 'idle':
        this._idleListen(listener as ListenCallback<IdleDeadline>, options as ListenOptions<IdleDeadline>)
        break
      case 'recognizeable':
        this._recognizeableListen(listener, options)
        break
      case 'visibilitychange':
        this._visibilityChangeListen(listener, options)
        break
      case 'keycombo':
        this._keycomboListen(listener, options)
        break
      case 'leftclickcombo':
      case 'rightclickcombo':
        this._clickcomboListen(listener, options)
        break
      case 'event':
        this._eventListen(listener, options)
        break
      }

    this._listening()

    return this
  }
  _observationListen (listener: ListenCallback<ListenableSupportedObservation>, options: ListenOptions<ListenableSupportedObservation>) {
    const { target = document.querySelector('html') } = options,
          observerInstance = toObserver({ type: this.type as 'intersect' | 'mutate' | 'resize', listener }, 'observer' in options ? (options as ListenOptions<IntersectionObserverEntry>).observer : {})

    observerInstance.observe(target, 'observe' in options ? ((options as ListenOptions<MutationRecord | ResizeObserverEntry>).observe as EventType extends MutationRecord ? MutationObserverInit : ResizeObserverOptions) : {})
    this.active.add({ target, id: observerInstance, category: 'observation' })
  }
  _mediaQueryListen (listener: ListenCallback<MediaQueryListEvent>) {
    const target = window.matchMedia(this.type)

    target.addEventListener('change', listener)
    this.active.add({ target, id: ['change', listener], category: 'mediaquery' })
  }
  _idleListen (listener: IdleRequestCallback, options: ListenOptions<IdleDeadline>) {
    const { requestIdleCallback } = options,
          id = window.requestIdleCallback(listener, requestIdleCallback)

    this.active.add({ target: window, id, category: 'idle' })
  }
  _recognizeableListen (listener: ListenCallback<EventType>, options: ListenOptions<EventType>) {
    const { exceptAndOnlyListener, listenerOptions } = toAddEventListenerParams<EventType>(listener, options),
          eventListeners = this._computedRecognizeableEvents.map(name => {
            return [name, event => {
              this.recognizeable.recognize(event)

              if (this.recognizeable.status === 'recognized') {
                exceptAndOnlyListener(event)
              }
            }, ...listenerOptions]
          })

    this.recognizeable.setListener(exceptAndOnlyListener)

    this._addEventListeners(eventListeners, options)
  }
  _visibilityChangeListen (listener: ListenCallback<EventType>, naiveOptions) {
    const options = {
      ...naiveOptions,
      target: document,
    }
    
    this._eventListen(listener, options)
  }
  _keycomboListen (listener: ListenCallback<EventType>, options: ListenOptions<EventType>) {
    const combo = toCombo(this.type, options.comboDelimiter).map(name => ({ name, type: comboItemNameToType(name) })),
          guardedListener = (event: EventType) => {            
            if (eventMatchesKeycombo({ event, combo })) {
              listener(event)
            }
          }
    
    this._eventListen(guardedListener, options)
  }
  _clickcomboListen (listener: ListenCallback<EventType>, options: ListenOptions<EventType>) {
    const combo = toCombo(this.type, options.comboDelimiter),
          guardedListener = (event: EventType) => {
            if (eventMatchesClickcombo({ event, combo })) {
              listener(event)
            }
          }
    
    this._eventListen(guardedListener, options)
  }
  _eventListen (listener: ListenCallback<EventType>, options: ListenOptions<EventType>) {
    const type = (() => {
      switch (this._computedCategory) {
        case 'keycombo':
          return `key${options.keyDirection || 'down'}`
        case 'leftclickcombo': // click | mousedown | mouseup
          return this.type.match(/(\w+)$/)[1]
        case 'rightclickcombo':
          return 'contextmenu'
        default:
          return this.type
      }
    })()

    const { exceptAndOnlyListener, listenerOptions } = toAddEventListenerParams<EventType>(listener, options),
          eventListeners: ListenableActiveEventId<EventType>[] = [[type, exceptAndOnlyListener, ...listenerOptions]]

    this._addEventListeners(eventListeners, options)
  }
  _addEventListeners (
    eventListeners: ListenableActiveEventId<EventType>[],
    options: ListenOptions<EventType>
  ) {
    const { target = document } = options

    eventListeners.forEach(eventListener => {
      target.addEventListener(...eventListener)
      this.active.add({ target, id: eventListener, category: 'event' })
    })
  }
  _listening () {
    this._computedStatus = 'listening'
  }

  stop (options: { target?: Element } = {}) {
    const { target } = options

    switch (this.status) {
      case 'ready':
      case undefined:
        // Do nothing. This call is coming from the initial setType
        // and shouldn't use web APIs during construction.
        break
      default:
        const stoppables = [...this.active].filter(active => !('target' in active) || active.target === target), // Normally would use .isSameNode() here, but it needs to support MediaQueryLists too
              shouldUpdateStatus = stoppables.length === this.active.size

        stoppables.forEach(stoppable => {
          const { category } = stoppable
          stopsByCategory[category](stoppable)
          this.active.delete(stoppable)
        })
        
        if (shouldUpdateStatus) {
          this._stopped()
        }

        break
      }

    return this
  }
  _stopped () {
    this._computedStatus = 'stopped'
  }
}

const stopsByCategory = {
  observation: <EventType>({ id }: ListenableActive<EventType>) => 
    (id as IntersectionObserver | MutationObserver | ResizeObserver).disconnect(),
  mediaquery: <EventType>({ target, id }: ListenableActive<EventType>) => 
    (target as MediaQueryList).removeEventListener(id[0], id[1]),
  idle: <EventType>({ target, id }: ListenableActive<EventType>) => 
    (target as Window).cancelIdleCallback(id as number),
  event: <EventType>({ target, id }: ListenableActive<EventType>) => 
    target.removeEventListener(...id),
}
