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
const recognizableListenerApi = {
  toDirection
}

export default class Listenable {
  constructor (eventName, options = {}) {
    /* Options */

    /* Public properties */
    this.eventName = eventName

    /* Private properties */
    this._recognizable = options.recognizable || undefined
    this._observer = observers[this.eventName]

    this._type = this._getType()

    this._computedActiveListeners = []

    if (this._type === 'recognizable') {
      warn('hasRequiredOptions', {
        received: this._recognizable,
        required: ['setup', 'events', 'recognized'],
        every: true,
        subject: 'Listenable\'s gesture option',
        docs: 'https://baleada.netlify.com/docs/logic/listenable',
      })
    }

    /* Dependency */
  }

  _getType () {
    return (is.defined(this._recognizable) && 'recognizable') ||
      (is.defined(this._observer) && 'observation') ||
      (/^\(.+\)$/.test(this.eventName) && 'mediaQuery') ||
      (this.eventName === 'idle' && 'idle') ||
      (this.eventName === 'visibilitychange' && 'visibilitychange') ||
      'event'
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
    switch (this._type) {
    case 'observation':
      this._observationListen(listener, options)
      break
    case 'mediaQuery':
      this._mediaQueryListen(listener, options)
      break
    case 'idle':
      this._idleListen(listener, options)
      break
    case 'recognizable':
      this._recognizableListen(listener, options)
      break
    case 'visibilitychange':
      this._visibilityChangeListen(listener, options)
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
    this._computedActiveListeners.push({ target, id: listener, type: 'mediaQuery' })
  }
  _idleListen (listener, options) {
    const { idle: idleOptions = {} } = options,
          id = window.requestIdleCallback(listener, idleOptions)

    this._computedActiveListeners.push({ id, type: 'idle' })
  }
  _recognizableListen (listener, options) {
    const { recognize: recognizeOptions } = options,
          { blackAndWhiteListedListener, listenerOptions } = this._getAddEventListenerSetup(listener, options),
          { sequence, options: recognizableOptions } = this._recognizable,
          recognizable = new Recognizable(sequence, recognizableOptions),
          eventListeners = events.map(name => {
            return [name, event => {
              if (recognized(event, recognizable)) {
                blackAndWhiteListedListener(event, recognizable, recognizableListenerApi)
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
