/*
 * Listenable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

/* Dependencies */
// import * as gestures from '@baleada/gesture/lib/stubs'

/* Utils */

/* Dictionaries */
import { observers, gestures, gestureListenerApi } from '../constants'

export default class Listenable {
  // _element
  // _touchOptions
  // _store
  // _computedActiveListeners
  // _eventListenersGetter

  constructor (eventName, options = {}) {
    /* Options */
    
    /* Public properties */
    this.eventName = eventName

    /* Private properties */
    this._computedGesture = options.gesture
    this._gestureTypes = this._gestures.map(({ name }) => name)
    this._computedActiveListeners = []

    /* Dependency */
  }

  get activeListeners () {
    return this._computedActiveListeners
  }

  get isObservation () {
    return observers.hasOwnProperty(this.eventName)
  }

  get observer () {
    return this._computedObserver
  }

  get isGesture () {
    this._gestureTypes.includes(this.eventName)
  }

  get gesture () {
    return this._computedGesture
  }

  setEventName (eventName) {
    this.stop()
    this.eventName = eventName
    // TODO: re-add all active listeners?
    return this
  }

  listen (listener, options = {}) {
    const { addEventListener, observer: observerOptions, observe: observeOptions, useCapture, wantsUntrusted, blacklist, whitelist, element: rawElement, gesture: gestureOptions, listensToMouse } = options

    if (this.isObservation) {
      const observerInstance = observers[this.eventName](listener, observerOptions),
            element = rawElement || document.querySelector('html')

      observerInstance.observe(element, observeOptions)
      this._computedActiveListeners.push({ element, id: observerInstance })
    } else {
      const blackAndWhiteListedListener = this._getBlackAndWhiteListedListener({ listener, blacklist, whitelist }),
            options = [addEventListener || useCapture, wantsUntrusted],
            eventListeners = this.isGesture
              ? this._getGestureListeners(blackAndWhiteListedListener, { options, gestureOptions, listensToMouse })
              : [[this.eventName, blackAndWhiteListedListener, ...options]],
            element = rawElement || document

      eventListeners.forEach(eventListener => {
        element.addEventListener(...eventListener)
        this._computedActiveListeners.push({ element, id: eventListener })
      })
    }

    return this
  }
  _getBlackAndWhiteListedListener = function({ listener, blacklist: rawBlacklist, whitelist: rawWhitelist }) {
    const blacklist = rawBlacklist || [],
          whitelist = rawWhitelist || []
    function blackAndWhiteListedListener (arg) {
      const { target } = this.isGesture ? arg.lastEvent : arg,
            [isWhitelisted, isBlacklisted] = [whitelist, blacklist].map(selectors => selectors.some(selector => target.matches(selector)))

      if (isWhitelisted) { // Whitelist always wins
        listener(...arguments)
      } else if (whitelist.length === 0 && !isBlacklisted) {
        listener(...arguments)
      }
    }

    return blackAndWhiteListedListener.bind(this)
  }
  _getGestureListeners = function(blackAndWhiteListedListener, { options, gestureOptions, listensToMouse }) {
    const { constructor: Gesture, events, handle } = gestures.find(({ name }) => name === this.eventName),
          instance = new Gesture(gestureOptions),
          gestureListeners = events.map(name => {
            return [name, event => {
              if (instance[handle](event)) {
                blackAndWhiteListedListener(instance, gestureListenerApi)
              }
            }, ...options]
          })

    return gestureListeners
  }

  stop (options = {}) {
    const { element } = options,
          activeListeners = this.activeListeners.filter(({ element: e }) => !element || e.isSameNode(element))

    activeListeners.forEach(({ element: e, id }) => {
      if (this.isObservation) {
        id.disconnect()
      } else {
        e.removeEventListener(...id)
      }
    })

    return this
  }
}
