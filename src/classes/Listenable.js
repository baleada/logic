/*
 * Listenable.js
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

/* Dependencies */

/* Utils */

/* Dictionaries */
import touches from '../dictionaries/touches'
import observers from '../dictionaries/observers'

export default class Listenable {
  // _element
  // _touchOptions
  // _store
  // _activeListenerIds
  // _eventListenersGetter

  constructor (eventName, options = {}) {
    /* Options */
    options = {
      element: document,
      touches,
      touch: {},
      ...options
    }

    this._touches = options.touches
    this._element = options.element
    this._touchOptions = options.touch

    /* Public properties */
    this.eventName = eventName

    /* Private properties */
    this._isObserved = observers.hasOwnProperty(this.eventName)
    this._isTouch = this._touches.hasOwnProperty(this.eventName)
    this._computedEventMetadata = {}
    this._activeListenerIds = []

    /* Dependency */
  }

  get activeListeners () {
    return this._activeListenerIds
  }
  get eventMetadata () {
    return this._computedEventMetadata
  }

  setEventName (eventName) {
    this.stop()
    this.eventName = eventName
    this._isObserved = observers.hasOwnProperty(eventName)
    this._isTouch = this._touches.hasOwnProperty(eventName)
    // TODO: re-add all active listeners?
    return this
  }

  listen (listener, options = {}) {
    const { addEventListener, observer, observe, useCapture, wantsUntrusted } = options

    if (this._isObserved) {
      const observerInstance = new observers[this.eventName](listener, observer)
      observerInstance.observe(this.element, observe)
      this._activeListenerIds.push(observerInstance)
    } else {
      const options = [addEventListener || useCapture, wantsUntrusted],
            eventListeners = this._isTouch
              ? this._touches[this.eventName](listener, this._computedEventMetadata, this._touchOptions).map(eventListener => [...eventListener, ...options])
              : [[this.eventName, listener, ...options]]

      eventListeners.forEach(eventListener => {
        this._element.addEventListener(...eventListener)
        this._activeListenerIds.push(eventListener)
      })
    }

    return this
  }

  stop () {
    if (this._isObserved) {
      this.activeListeners.forEach(observerInstance => observerInstance.disconnect())
    } else {
      this.activeListeners.forEach(activeListener => this._element.removeEventListener(...activeListener))
    }

    return this
  }
}
