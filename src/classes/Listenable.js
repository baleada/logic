import { Recognizeable } from './Recognizeable.js'
import {
  toObserver,
  toCategory,
  toCombo,
  comboItemNameToType,
  toAddEventListenerParams,
  eventMatchesKeycombo,
  eventMatchesClickcombo,
} from '../util.js'

export class Listenable {
  // TODO: import recognizeable types
  /**
   * @param {string} type
   * @param {{ recognizeable?: any }} [options]
   */
  constructor (type, options = {}) {
    if (type === 'recognizeable') {
      this._computedRecognizeable = new Recognizeable([], options.recognizeable)
      this._computedRecognizeableEvents = Object.keys(options.recognizeable?.handlers || {})
    }    

    this._computedActive = new Set()

    this.setType(type)
    this._ready()
  }
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

  setType (type) {
    this.stop()
    this._computedType = type
    this._computedCategory = toCategory(type)
    return this
  }

  listen (listener, options = {}) {
    switch (this._computedCategory) {
      case 'observation':
        this._observationListen(listener, options)
        break
      case 'mediaquery':
        this._mediaQueryListen(listener, options)
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
  _observationListen (listener, options) {
    const { observer: observerOptions, observe: observeOptions, target = document.querySelector('html') } = options,
          observerInstance = toObserver({ type: this.type, listener, options: observerOptions })

    observerInstance.observe(target, observeOptions)
    this.active.add({ target, id: observerInstance, category: 'observation' })
  }
  _mediaQueryListen (listener) {
    const target = window.matchMedia(this.type)

    target.addEventListener('change', listener)
    this.active.add({ target, id: ['change', listener], category: 'mediaquery' })
  }
  _idleListen (listener, options) {
    const { requestIdleCallback = {} } = options,
          id = window.requestIdleCallback(listener, requestIdleCallback)

    this.active.add({ id, category: 'idle' })
  }
  _recognizeableListen (listener, options) {
    const { exceptAndOnlyListener, listenerOptions } = toAddEventListenerParams(listener, options),
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
  _keycomboListen (naiveListener, options) {
    const combo = toCombo(this.type, options.comboDelimiter).map(name => ({ name, type: comboItemNameToType(name) })),
          listener = event => {            
            if (eventMatchesKeycombo({ event, combo })) {
              naiveListener(event)
            }
          }
    
    this._eventListen(listener, options)
  }
  _clickcomboListen (naiveListener, options) {
    const combo = toCombo(this.type, options.comboDelimiter),
          listener = event => {
            if (eventMatchesClickcombo({ event, combo })) {
              naiveListener(event)
            }
          }
    
    this._eventListen(listener, options)
  }
  _eventListen (listener, options) {
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
  _addEventListeners (eventListeners, options) {
    const { target = document } = options

    eventListeners.forEach(eventListener => {
      target.addEventListener(...eventListener)
      this.active.add({ target, id: eventListener, category: 'event' })
    })
  }
  _listening () {
    this._computedStatus = 'listening'
  }

  stop (target) {
    switch (this.status) {
      case 'ready':
      case undefined:
        // Do nothing. This call is coming from the initial setType
        // and shouldn't use web APIs during construction.
        break
      default:
        const stoppable = [...this.active].filter(({ target: t }) => !target || t === target), // Normally would use .isSameNode() here, but it needs to support MediaQueryLists too
              shouldUpdateStatus = stoppable.length === this.active.size

        stoppable.forEach(stoppable => {
          const { target: t, id, category } = stoppable
          stopsByCategory[category]({ target: t, id })
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
  observation: ({ id }) => id.disconnect(),
  mediaquery: ({ target, id }) => target.removeEventListener(...id),
  idle: ({ id }) => window.cancelIdleCallback(id),
  event: ({ target, id }) => target.removeEventListener(...id),
}
