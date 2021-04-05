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

export class Listenable<EventType> {
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

  listen (listener, options: ListenOptions = {}) {
    switch (this._computedCategory) {
      case 'observation':
        this._observationListen(listener, options)
        break
      case 'mediaquery':
        this._mediaQueryListen(listener)
        break
      case 'idle':
        this._idleListen(listener, options)
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
  _observationListen (listener, options: ListenOptions) {
    const { observer: observerOptions, observe: observeOptions, target = document.querySelector('html') } = options,
          observerInstance = toObserver({ type: this.type as 'intersect' | 'mutate' | 'resize', listener }, observerOptions)

    observerInstance.observe(target, observeOptions)
    this.active.add({ target, id: observerInstance, category: 'observation' })
  }
  _mediaQueryListen (listener) {
    const target = window.matchMedia(this.type)

    target.addEventListener('change', listener)
    this.active.add({ target, id: ['change', listener], category: 'mediaquery' })
  }
  _idleListen (listener, options: ListenOptions) {
    const { requestIdleCallback } = options,
          id = window.requestIdleCallback(listener, requestIdleCallback)

    this.active.add({ id, category: 'idle' })
  }
  _recognizeableListen (listener, options: ListenOptions) {
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
  _visibilityChangeListen (listener, naiveOptions) {
    const options = {
      ...naiveOptions,
      target: document,
    }
    
    this._eventListen(listener, options)
  }
  _keycomboListen (listener, options: ListenOptions) {
    const combo = toCombo(this.type, options.comboDelimiter).map(name => ({ name, type: comboItemNameToType(name) })),
          guardedListener = (event: EventType) => {            
            if (eventMatchesKeycombo({ event, combo })) {
              listener(event)
            }
          }
    
    this._eventListen(guardedListener, options)
  }
  _clickcomboListen (listener, options: ListenOptions) {
    const combo = toCombo(this.type, options.comboDelimiter),
          guardedListener = (event: EventType) => {
            if (eventMatchesClickcombo({ event, combo })) {
              listener(event)
            }
          }
    
    this._eventListen(guardedListener, options)
  }
  _eventListen (listener, options: ListenOptions) {
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

    const { exceptAndOnlyListener, listenerOptions } = toAddEventListenerParams(listener, options),
          eventListeners = [[type, exceptAndOnlyListener, ...listenerOptions]]

    this._addEventListeners(eventListeners, options)
  }
  _addEventListeners (eventListeners, options: ListenOptions) {
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

export type ListenableOptions<EventType> = { recognizeable?: RecognizeableOptions<EventType> }
export type ListenOptions = {
  target?: Element,

  observer?: IntersectionObserverInit,
  observe?: ResizeObserverOptions | MutationObserverInit

  requestIdleCallback?: IdleRequestOptions,

  addEventListener?: AddEventListenerOptions,
  useCapture?: boolean,
  wantsUntrusted?: boolean,

  except?: string[],
  only?: string[],

  comboDelimiter?: string,
  keyDirection?: 'up' | 'down',
}
export type ListenableActive<EventType> = { category: ListenableCategory } & (
  { target: Element, id: IntersectionObserver | MutationObserver | ResizeObserver } 
  |
  { target: Element | Document, id: (event: EventType) => any }
  |
  { target: MediaQueryList, id: ['change', (event: EventType) => any] }
  |
  { id: number }
)

const stopsByCategory: { [category: string] : (stoppable: Stoppable) => any }  = {
  observation: ({ id }) => id.disconnect(),
  mediaquery: ({ target, id }) => target.removeEventListener(...id),
  idle: ({ id }) => window.cancelIdleCallback(id),
  event: ({ target, id }) => target.removeEventListener(...id),
}
