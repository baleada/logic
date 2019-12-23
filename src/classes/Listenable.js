/*
 * Listenable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

/* Dependencies */

/* Utils */
import { warn, is, toDirection } from '../util'

/* Constants */
import { observers } from '../constants'

// TODO: figure out why this was undefined when imported from constants
const gestureListenerApi = {
  toDirection
}

export default class Listenable {
  constructor (eventName, options = {}) {
    /* Options */

    /* Public properties */
    this.eventName = eventName

    /* Private properties */
    this._gesture = options.gesture || undefined
    this._isGesture = is.defined(this._gesture)
    this._observer = observers[this.eventName]
    this._isObservation = !!this._observer && !this._isGesture // custom gesture always wins
    this._isMediaQuery = /^\(.+\)$/.test(this.eventName) && !this._isGesture // custom gesture always wins
    this._isIdle = this.eventName === 'idle' && !this._isGesture // custom gesture always wins
    this._computedActiveListeners = []

    if (this._isGesture) {
      warn('hasRequiredOptions', {
        received: this._gesture,
        required: ['constructor', 'events', 'recognized'],
        every: true,
        subject: 'Listenable\'s gesture option',
        docs: 'https://baleada.netlify.com/docs/logic/listenable',
      })
    }

    /* Dependency */
  }

  get activeListeners () {
    return this._computedActiveListeners
  }

  setEventName (eventName) {
    // TODO: stop listeners and re-add afterward?
    this.eventName = eventName
    return this
  }

  listen (listener, options = {}) {
    switch (true) {
    case this._isObservation:
      return this._observationListen(listener, options)
    case this._isMediaQuery:
      return this._mediaQueryListen(listener, options)
    case this._isIdle:
      return this._idleListen(listener, options)
    case this._isGesture:
      return this._gestureListen(listener, options)
    default:
      return this._eventListen(listener, options)
    }
  }
  _observationListen = function(listener, options) {
    const { observer: observerOptions, observe: observeOptions, target = document.querySelector('html') } = options,
          observerInstance = this._observer(listener, observerOptions)

    observerInstance.observe(target, observeOptions)
    this._computedActiveListeners.push({ target, id: observerInstance, type: 'observation' })

    return this
  }
  _mediaQueryListen = function(listener) {
    const target = window.matchMedia(this.eventName)

    target.addListener(listener)
    this._computedActiveListeners.push({ target, id: listener, type: 'mediaQuery' })

    return this
  }
  _idleListen = function(listener, options) {
    const { idle: idleOptions = {} } = options,
          id = window.requestIdleCallback(listener, idleOptions)

    this._computedActiveListeners.push({ id, type: 'idle' })

    return this
  }
  _gestureListen = function(listener, options) {
    const { gesture: gestureOptions } = options,
          { blackAndWhiteListedListener, listenerOptions } = this._getAddEventListenerSetup(listener, options),
          { factory: gestureFactory, events, recognized } = this._gesture,
          gesture = gestureFactory(gestureOptions),
          eventListeners = events.map(name => {
            return [name, event => {
              if (recognized(event, gesture)) {
                blackAndWhiteListedListener(event, gesture, gestureListenerApi)
              }
            }, ...listenerOptions]
          })

    this._addEventListeners(eventListeners, options)

    return this
  }
  _eventListen = function(listener, options) {
    const { blackAndWhiteListedListener, listenerOptions } = this._getAddEventListenerSetup(listener, options),
          eventListeners = [[this.eventName, blackAndWhiteListedListener, ...listenerOptions]]

    this._addEventListeners(eventListeners, options)

    return this
  }
  _getAddEventListenerSetup = function(listener, options) {
    const { addEventListener, useCapture, wantsUntrusted } = options,
          blackAndWhiteListedListener = this._getBlackAndWhiteListedListener(listener, options),
          listenerOptions = [addEventListener || useCapture, wantsUntrusted]

    return { blackAndWhiteListedListener, listenerOptions }
  }
  _getBlackAndWhiteListedListener = function(listener, options) {
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
  _addEventListeners = function(eventListeners, options) {
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
      case type === 'mediaQuery':
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
