/*
 * Listenable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

/* Dependencies */
import Recognizeable from './Recognizeable'

/* Utils */
import {
  re,
  toObserver,
  toCategory,
  toModifier,
  toKeyType,
  toAddEventListenerParams,
} from '../util'

/* Factories */
import uniqueable from '../factories'

/* Constants */
const defaultOptions = {
  keyDirection: 'down',
}

export default class Listenable {
  constructor (type, options = {}) {
    if (type === 'recognizeable') {
      this._computedRecognizeable = new Recognizeable([], options.recognizeable)
      this._computedRecognizeableEvents = Object.keys(options.recognizeable?.handlers || {})
    }

    // Has no effect if the type is not detected as keycombo
    this._keyDirection = options?.keyDirection || defaultOptions.keyDirection

    this._computedActiveListeners = []

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
  get activeListeners () {
    return this._computedActiveListeners
  }
  get recognizeable () {
    return this._computedRecognizeable
  }

  setType (type) {
    this.stop()
    this._computedType = type
    this._computedCategpry = toCategory(type)
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
    this._computedActiveListeners.push({ target, id: observerInstance, type: 'observation' })
  }
  _mediaQueryListen (listener) {
    const target = window.matchMedia(this.type)

    target.addEventListener('change', listener)
    this._computedActiveListeners.push({ target, id: listener, type: 'mediaquery' })
  }
  _idleListen (listener, options) {
    const { requestIdleCallback = {} } = options,
          id = window.requestIdleCallback(listener, requestIdleCallback)

    this._computedActiveListeners.push({ id, type: 'idle' })
  }
  _recognizeableListen (listener, options) {
    const { exceptAndOnlyListener, listenerOptions } = toAddEventListenerParams(listener, options),
          eventListeners = this._computedRecognizeableEvents.map(name => {
            return [name, event => {
              this._computedRecognizeable.recognize(event)

              if (this._computedRecognizeable.status === 'recognized') {
                exceptAndOnlyListener(event)
              }
            }, ...listenerOptions]
          })

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
    const keys = uniqueable(this.type.split('+'))
            .unique()
            .map(name => ({ name: name === '' ? '+' : name, type: toKeyType(name) })),
          listener = event => {
            const matches = fromKeysToMatches({ event, keys })
            
            if (matches) {
              naiveListener(event)
            }
          }
    
    this._eventListen(listener, options)
  }
  _clickcomboListen (naiveListener, options) {
    const keys = this.type.split('+'),
          listener = event => {
            const matches = keys.every(key => re.click.test(key) || (!key.startsWith('!') && modifiersByAssertion[key](event)) || (key.startsWith('!') && !modifiersByAssertion[key](event)))

            if (matches) {
              naiveListener(event)
            }
          }
    
    this._eventListen(listener, options)
  }
  _eventListen (listener, options) {
    let type
    switch (this._computedCategory) {
    case 'keycombo':
      type = `key${this._keyDirection}`
      break
    case 'leftclickcombo':
      type = this.type.match(/(\w+)$/)[1]
      break
    case 'rightclickcombo':
      type = 'contextmenu'
      break
    default:
      type = this.type
      break
    }

    const { exceptAndOnlyListener, listenerOptions } = toAddEventListenerParams(listener, options),
          eventListeners = [[type, exceptAndOnlyListener, ...listenerOptions]]

    this._addEventListeners(eventListeners, options)
  }
  _addEventListeners (eventListeners, options) {
    const { target = document } = options

    eventListeners.forEach(eventListener => {
      target.addEventListener(...eventListener)
      this._computedActiveListeners.push({ target, id: eventListener, type: 'event' })
    })
  }
  _listening () {
    this._computedStatus = 'listening'
  }

  stop (target) {
    switch (this.status) {
    case 'ready':
    case undefined:
      // Do nothing. Don't use web APIs during construction or before doing anything else.
      break
    default:
      const stoppable = !!target
              ? this.activeListeners.filter(({ target: t }) => t === target) // Normally would use .isSameNode() here, but it needs to support MediaQueryLists too
              : this.activeListeners

      stoppable.forEach(({ target: t, id, type }) => {
        switch (true) {
        case type === 'observation':
          id.disconnect()
          break
        case type === 'mediaquery':
          t.removeEventListener(id)
          break
        case type === 'idle':
          window.cancelIdleCallback(id)
          break
        case type === 'event':
          t.removeEventListener(...id)
          break
        }
      })
      
      if (stoppable.length = this.activeListeners.length) {
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
