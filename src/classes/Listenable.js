/*
 * Listenable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

/* Dependencies */

/* Utils */

/* Dictionaries */
import { recognizables, observers } from '../dictionaries'
import { touchTypes, listenerApi } from '../constants'
import { toMouseListeners } from '../util/functions'

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
    this._isObserved = observers.hasOwnProperty(this.eventName)
    this._isTouch = touchTypes.includes(this.eventName)
    this._computedActiveListeners = []

    /* Dependency */
  }

  get activeListeners () {
    return this._computedActiveListeners
  }

  setEventName (eventName) {
    this.stop()
    this.eventName = eventName
    this._isObserved = observers.hasOwnProperty(eventName)
    this._isTouch = recognizables.hasOwnProperty(eventName)
    // TODO: re-add all active listeners?
    return this
  }

  listen (listener, options = {}) {
    const { addEventListener, observer: observerOptions, observe: observeOptions, useCapture, wantsUntrusted, blacklist, whitelist, element: rawElement, recognize: recognizeOptions, listensToMouse } = options

    if (this._isObserved) {
      const observerInstance = observers[this.eventName](listener, observerOptions),
            element = rawElement || document.querySelector('html')

      observerInstance.observe(element, observeOptions)
      this._computedActiveListeners.push({ element, id: observerInstance })
    } else {
      const blackAndWhiteListedListener = this._getBlackAndWhiteListedListener({ listener, blacklist, whitelist }),
            options = [addEventListener || useCapture, wantsUntrusted],
            eventListeners = this._isTouch
              ? this._getTouchListeners(blackAndWhiteListedListener, { options, recognizeOptions, listensToMouse })
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
      const { target } = this.isTouch ? arg.lastEvent : arg,
            [isWhitelisted, isBlacklisted] = [whitelist, blacklist].map(selectors => selectors.some(selector => target.matches(selector)))

      if (isWhitelisted) { // Whitelist always wins
        listener(...arguments)
      } else if (isBlacklisted) {
        // do nothing
      } else if (whitelist.length === 0) {
        listener(...arguments)
      }
    }

    return blackAndWhiteListedListener
  }
  _getTouchListeners = function(blackAndWhiteListedListener, { options, recognizeOptions, listensToMouse }) {
    const recognizable = new recognizables[this.eventName](recognizeOptions),
          touchListeners = ['touchstart', 'touchmove', 'touchcancel', 'touchend'].map(touchType => {
            return [touchType, event => {
              recognizable.handle(event)
              if (recognizable.recognized) {
                blackAndWhiteListedListener(recognizable, listenerApi)
              }
            }, ...options]
          }),
          mouseListeners = listensToMouse
            ? toMouseListeners(touchListeners)
            : []

    return [
      ...touchListeners,
      ...mouseListeners,
    ]
  }

  stop (options = {}) {
    const { element } = options,
          activeListeners = this.activeListeners.filter(({ element: e }) => !element || e.isSameNode(element))

    activeListeners.forEach(({ element: e, id }) => {
      if (this._isObserved) {
        id.disconnect()
      } else {
        e.removeEventListener(...id)
      }
    })

    return this
  }
}
