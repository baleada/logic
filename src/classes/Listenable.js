/*
 * Listenable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

/* Dependencies */
import Recognizeable from './Recognizeable'

/* Utils */
import { is, toDirection } from '../util'

/* Constants */
import { observers } from '../constants'
const mediaQueryRegexp = /^\(.+\)$/,
      keycomboRegexp = /^(?:cmd\+|shift\+|ctrl\+|alt\+|opt\+){0,4}(?:[a-zA-Z0-9]|tab|up|right|down|left|enter|backspace)$/,
      leftclickcomboRegexp = /^(?:cmd\+|shift\+|ctrl\+|alt\+|opt\+){0,4}click$/,
      rightclickcomboRegexp = /^(?:cmd\+|shift\+|ctrl\+|alt\+|opt\+){0,4}rightclick$/,
      letterNumberRegexp = /^[a-zA-Z0-9]$/,
      arrowRegexp = /^(?:up|down|right|left)$/,
      enterBackspaceTabRegexp = /^(?:enter|backspace|tab)$/,
      modifierRegexp = /^(?:cmd|shift|ctrl|alt|opt)$/,
      clickRegexp = /^(?:right)?click$/,
      modifierAssertDictionary = {
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
    if (options.hasOwnProperty('recognizeable')) {
      this._computedRecognizeable = new Recognizeable([], options.recognizeable)
      this._computedRecognizeableEvents = Object.keys(options.recognizeable.handlers || {}) // TODO: handle error for undefined handlers
    }
    this._observer = observers[eventName]

    this._type = this._getType(eventName)

    this._computedActiveListeners = []

    this.setEventName(eventName)
    this._ready()
  }
  _ready () {
    this._computedStatus = 'ready'
  }

  _getType (eventName) {
    return (this._computedRecognizeable instanceof Recognizeable && 'recognizeable') ||
      (is.defined(this._observer) && 'observation') ||
      (mediaQueryRegexp.test(eventName) && 'mediaquery') ||
      (eventName === 'idle' && 'idle') ||
      (eventName === 'visibilitychange' && 'visibilitychange') ||
      (keycomboRegexp.test(eventName) && 'keycombo') ||
      (leftclickcomboRegexp.test(eventName) && 'leftclickcombo') ||
      (rightclickcomboRegexp.test(eventName) && 'rightclickcombo') ||
      'event'
  }

  get eventName () {
    return this._computedEventName
  }
  set eventName (eventName) {
    this.setEventName(eventName)
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

  setEventName (eventName) {
    this.stop()
    this._computedEventName = eventName
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
    const { requestIdleCallback = {} } = options,
          id = window.requestIdleCallback(listener, requestIdleCallback)

    this._computedActiveListeners.push({ id, type: 'idle' })
  }
  _recognizeableListen (listener, options) {
    const { blackAndWhiteListedListener, listenerOptions } = this._getAddEventListenerSetup(listener, options),
          eventListeners = this._computedRecognizeableEvents.map(name => {
            return [name, event => {
              this._computedRecognizeable.recognize(event)

              if (this._computedRecognizeable.status === 'recognized') {
                blackAndWhiteListedListener(event, this.recognizeable, recognizeableListenerApi)
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
    const keys = this.eventName
            .split('+')
            .map(name => ({ name, type: this._getKeyType(name) })),
          listener = event => {
            const matches = keys.every(({ name, type }) => {
              let matches
              switch (type) {
              case 'letter':
              case 'enterBackspaceTab':
                matches = event.key.toLowerCase() === name.toLowerCase()
                break
              case 'arrow':
                matches = event.key.toLowerCase() === `arrow${name.toLowerCase()}`
                break
              case 'modifier':
                matches = modifierAssertDictionary[name](event)
                break
              }

              return matches
            })
            
            if (matches) {
              naiveListener(event)
            }
          }
    
    this._eventListen(listener, options)
  }
  _getKeyType (name) {
    return letterNumberRegexp.test(name)
            ? 'letter'
            : arrowRegexp.test(name)
              ? 'arrow'
              : enterBackspaceTabRegexp.test(name)
                ? 'enterBackspaceTab'
                : modifierRegexp.test(name)
                  ? 'modifier'
                  : false // shouldn't be possible
  }
  _clickcomboListen (naiveListener, options) {
    const keys = this.eventName.split('+'),
          listener = event => {
            const matches = keys.every(key => clickRegexp.test(key) || modifierAssertDictionary[key](event))

            if (matches) {
              naiveListener(event)
            }
          }
    
    this._eventListen(listener, options)
  }
  _eventListen (listener, options) {
    let eventName
    switch (this._type) {
    case 'keycombo':
      eventName = 'keydown'
      break
    case 'leftclickcombo':
      eventName = 'click'
      break
    case 'rightclickcombo':
      eventName = 'contextmenu'
      break
    default:
      eventName = this.eventName
      break
    }

    const { blackAndWhiteListedListener, listenerOptions } = this._getAddEventListenerSetup(listener, options),
          eventListeners = [[eventName, blackAndWhiteListedListener, ...listenerOptions]]

    this._addEventListeners(eventListeners, options)
  }
  _getAddEventListenerSetup (listener, options) {
    const { addEventListener, useCapture, wantsUntrusted } = options,
          blackAndWhiteListedListener = this._getBlackAndWhiteListedListener(listener, options),
          listenerOptions = [addEventListener || useCapture, wantsUntrusted]

    return { blackAndWhiteListedListener, listenerOptions }
  }
  _getBlackAndWhiteListedListener (listener, options) {
    const { except = [], only = [] } = options

    function blackAndWhiteListedListener (event) {
      const { target } = event,
            [isWhitelisted, isBlacklisted] = [only, except].map(selectors => selectors.some(selector => target.matches(selector)))

      if (isWhitelisted) { // Whitelist always wins
        listener(...arguments)
      } else if (only.length === 0 && !isBlacklisted) { // Ignore blacklist when whitelist has elements
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
      const stoppable = is.defined(target)
              ? this.activeListeners.filter(({ target: t }) => t === target) // Normally would use .isSameNode() here, but it needs to support MediaQueryLists too
              : this.activeListeners

      stoppable.forEach(({ target: t, id, type }) => {
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
