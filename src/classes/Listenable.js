/*
 * Listenable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

/* Dependencies */
// import * as gestures from '@baleada/gesture/lib/stubs'

/* Utils */
import { warn } from '../util'

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
    this._gesture = options.gesture || gestures.find(({ name }) => name === eventName) || undefined
    warn('hasRequiredOptions', {
      received: this._gesture,
      required: ['constructor', 'events', 'handle'],
      every: true,
      subject: 'Listenable\'s gesture option',
      docs: 'https://baleada.netlify.com/docs/logic/listenable',
    })
    this._isGesture = !!this._gesture
    this._observer = observers[this.eventName]
    this._isObservation = !!this._observer
    this._computedActiveListeners = []

    /* Dependency */
  }

  get activeListeners () {
    return this._computedActiveListeners
  }

  setEventName (eventName) {
    this.stop()
    this.eventName = eventName
    // TODO: re-add all active listeners?
    return this
  }

  listen (listener, options = {}) {
    const { addEventListener, observer: observerOptions, observe: observeOptions, useCapture, wantsUntrusted, blacklist, whitelist, element: rawElement, gesture: gestureOptions, listensToMouse } = options

    if (this._isObservation) {
      const observerInstance = this._observer(listener, observerOptions),
            element = rawElement || document.querySelector('html')

      observerInstance.observe(element, observeOptions)
      this._computedActiveListeners.push({ element, id: observerInstance })
    } else {
      const blackAndWhiteListedListener = this._getBlackAndWhiteListedListener({ listener, blacklist, whitelist }),
            options = [addEventListener || useCapture, wantsUntrusted],
            eventListeners = this._isGesture
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
      const { target } = this._isGesture ? arg.lastEvent : arg,
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
    const { constructor: Gesture, events, handle } = this._gesture,
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
      if (this._isObservation) {
        id.disconnect()
      } else {
        e.removeEventListener(...id)
      }
    })

    return this
  }
}
