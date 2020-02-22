/*
 * Listenable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

/* Dependencies */
import Recognizeable from './Recognizeable'

/* Utils */
import { warn, is, toDirection } from '../util'

/* Constants */
import { observers } from '../constants'
import getClicksHandlers from '../../../listenable-gestures/src/handler-getters/clicks'
const keyComboRegexp = /^(cmd\+|shift\+|ctrl\+|alt\+|opt\+){0,4}([a-zA-Z]{1}?|shift|cmd|ctrl|alt|opt)$/,
      clickComboRegexp = /^(cmd\+|shift\+|ctrl\+|alt\+|opt\+){1,4}click$/,
      letterRegexp = /^[a-zA-Z]$/,
      keyAssertDictionary = {
        shift: event => event.shiftKey,
        cmd: event => event.metaKey,
        ctrl: event => event.ctrlKey,
        alt: event => event.altKey,
        opt: event => event.altKey,
      }

// TODO: figure out why this was undefined when imported from constants
const recognizeableListenerApi = {
  toDirection
}

export default class Listenable {
  constructor (eventName, options = {}) {
    /* Options */

    /* Private properties */
    this._recognizeable = options.recognizeable || undefined
    this._observer = observers[this.eventName]

    this._type = this._getType()

    this._computedActiveListeners = []

    this.setEventName(eventName)
  }

  _getType () {
    return (is.defined(this._recognizeable) && 'recognizeable') ||
      (is.defined(this._observer) && 'observation') ||
      (/^\(.+\)$/.test(this.eventName) && 'mediaquery') ||
      (this.eventName === 'idle' && 'idle') ||
      (this.eventName === 'visibilitychange' && 'visibilitychange') ||
      (keyComboRegexp.test(this.eventName) && 'keycombo') ||
      (clickComboRegexp.test(this.eventName) && 'clickcombo') ||
      'event'
  }

  get activeListeners () {
    return this._computedActiveListeners
  }

  setEventName (eventName) {
    this.stop()
    this.eventName = eventName
    return this
  }

  listen (listener, options = {}) {
    switch (this._type) {
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
      this._keyComboListen(listener, options)
      break
    case 'clickcombo':
      this._clickComboListen(listener, options)
      break
    case 'event':
      this._eventListen(listener, options)
      break
    }

    return this
  }
  _observationListen (listener, options) {
    const { observer: observerOptions, observe: observeOptions, target = document.querySelector('html') } = options,
          observerInstance = this._observer(listener, observerOptions)

    observerInstance.observe(target, observeOptions)
    this._computedActiveListeners.push({ target, id: observerInstance, type: 'observation' })
  }
  _mediaQueryListen (listener) {
    const target = window.matchMedia(this.eventName)

    target.addListener(listener)
    this._computedActiveListeners.push({ target, id: listener, type: 'mediaquery' })
  }
  _idleListen (listener, options) {
    const { idle: idleOptions = {} } = options,
          id = window.requestIdleCallback(listener, idleOptions)

    this._computedActiveListeners.push({ id, type: 'idle' })
  }
  _recognizeableListen (listener, options) {
    const { blackAndWhiteListedListener, listenerOptions } = this._getAddEventListenerSetup(listener, options),
          { sequence, options: recognizeableOptions } = this._recognizeable,
          recognizeable = new Recognizeable(sequence, recognizeableOptions),
          events = Object.keys(recognizeableOptions.handlers)
          eventListeners = events.map(name => {
            return [name, event => {
              recognizeable.recognize(event)

              if (recognizeable.status === 'recognized') {
                blackAndWhiteListedListener(event, recognizeable, recognizeableListenerApi)
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
  _keyComboListen (naiveListener, options) {
    const keys = this.eventName.split('.'),
          listener = event => {
            const matches = event.type === 'keydown' && keys.every(key => letterRegexp.test(key) ? event.key === key.toUpperCase() : !keyAssertDictionary[key](event))

            if (matches) {
              naiveListener(event)
            }
          }
    
    this._eventListen(listener, options)
  }
  _clickComboListen (naiveListener, options) {
    const keys = this.eventName.split('.'),
          listener = event => {
            const matches = event.type === 'click' && keys.every(key => !keyAssertDictionary[key](event))

            if (matches) {
              naiveListener(event)
            }
          }
    
    this._eventListen(listener, options)
  }
  _eventListen (listener, options) {
    const { blackAndWhiteListedListener, listenerOptions } = this._getAddEventListenerSetup(listener, options),
          eventListeners = [[this.eventName, blackAndWhiteListedListener, ...listenerOptions]]

    this._addEventListeners(eventListeners, options)
  }
  _getAddEventListenerSetup (listener, options) {
    const { addEventListener, useCapture, wantsUntrusted } = options,
          blackAndWhiteListedListener = this._getBlackAndWhiteListedListener(listener, options),
          listenerOptions = [addEventListener || useCapture, wantsUntrusted]

    return { blackAndWhiteListedListener, listenerOptions }
  }
  _getBlackAndWhiteListedListener (listener, options) {
    const { blacklist = [], whitelist = [] } = options

    function blackAndWhiteListedListener (event) {
      const { target } = event,
            [isWhitelisted, isBlacklisted] = [whitelist, blacklist].map(selectors => selectors.some(selector => target.matches(selector)))

      if (isWhitelisted) { // Whitelist always wins
        listener(...arguments)
      } else if (whitelist.length === 0 && !isBlacklisted) {
        listener(...arguments)
      }
    }

    return blackAndWhiteListedListener.bind(this)
  }
  _addEventListeners (eventListeners, options) {
    const { target = document } = options

    eventListeners.forEach(eventListener => {
      target.addEventListener(...eventListener)
      this._computedActiveListeners.push({ target, id: eventListener, type: 'event' })
    })
  }

  stop (options = {}) {
    const { target } = options,
          activeListeners = this._isMediaQuery
            ? this.activeListeners
            : this.activeListeners.filter(({ target: t }) => !target || t === target) // Not using .isSameNode() here because it needs to handle MediaQueryLists too

    activeListeners.forEach(({ target: t, id, type }) => {
      switch (true) {
      case type === 'observation':
        id.disconnect()
        break
      case type === 'mediaquery':
        t.removeListener(id)
        break
      case type === 'idle':
        window.cancelIdleCallback(id)
        break
      case type === 'event':
        t.removeEventListener(...id)
        break
      }
    })

    return this
  }
}
