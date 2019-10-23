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
  // _recognizerOptions
  // _store
  // _activeListenerIds
  // _eventListenersGetter

  constructor (eventName, options = {}) {
    /* Options */
    options = {
      element: document,
      recognizer: {},
      ...options
    }

    this._element = options.element
    this._recognizerOptions = options.recognizer

    /* Public properties */
    this.eventName = eventName

    /* Private properties */
    this._isObserved = observers.hasOwnProperty(this.eventName)
    this._isTouch = touches.hasOwnProperty(this.eventName)
    this._computedEventData = {}
    this._activeListenerIds = []

    /* Dependency */
  }

  get activeListeners () {
    return this._activeListenerIds
  }
  get eventData () {
    return this._computedEventData
  }

  setEventName (eventName) {
    this.destroy()
    this.eventName = eventName
    this._isObserved = observers.hasOwnProperty(eventName)
    this._isTouch = touches.hasOwnProperty(eventName)
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
              ? touches[this.eventName](listener, this._computedEventData, this._recognizerOptions).map(eventListener => [...eventListener, ...options])
              : [[this.eventName, listener, ...options]]

      eventListeners.forEach(eventListener => {
        this._element.addEventListener(...eventListener)
        this._activeListenerIds.push(eventListener)
      })
    }

    return this
  }

  destroy (activeListener) {
    if (this._isObserved) {
      this.activeListeners.forEach(observerInstance => observerInstance.disconnect())
    } else {
      this.activeListeners.forEach(activeListener => this._element.removeEventListener(...activeListener))
    }

    return this
  }
}
