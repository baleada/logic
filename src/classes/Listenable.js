/*
 * Listenable.js
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

/* Dependencies */

/* Utils */
import is from '../util/is'

/* Dictionaries */
import touchDictionary from '../dictionaries/touches'
import observerDictionary from '../dictionaries/observers'

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
    this._store = {}
    this._activeListenerIds = []

    /* Dependency */
  }

  get activeListeners () {
    return this._activeListenerIds
  }
  get eventData () {
    return this._store
  }

  /* Public getters */

  /* Public methods */
  setEventName (eventName) {
    this.destroy()
    this.eventName = eventName
    return this
  }

  listen (listener, { listenerOptions, observerOptions, observeOptions, useCapture, wantsUntrusted }) {
    if (this._isObserved()) {
      const observer = new observerDictionary[this.eventName](listener, optionsOrUseCapture)
      observer.observe(this.element, observeOptions)
      this._activeListenerIds.push(observer)
    } else {
      const eventListeners = this._getEventListeners(listener, optionsOrUseCapture, wantsUntrusted)

      eventListeners.forEach(eventListener => {
        this._element.addEventListener(...eventListener)
        this._activeListenerIds.push(this._getId(eventListener))
      })
    }

    return this
  }
  _isObserved = function() {
    return observerDictionary.hasOwnProperty(this.eventName)
  }
  _getEventListeners = function(listener, optionsOrUseCapture, wantsUntrusted) {
    const options = [optionsOrUseCapture, wantsUntrusted],
          getter = this._isTouch()
            ? this._getTouchEventListeners
            : (listener, options) => [[this.eventName, listener, ...options]]
    return this._eventListenersGetter(listener, options)
  }
  _isTouch = function() {
    return touchDictionary.hasOwnProperty(this.eventName)
  }
  _getTouchEventListeners = function(listener, options) {
    return touchDictionary[this.eventName](listener, this._store, this._recognizerOptions)
      .map(eventListener => [...eventListener, ...options])
  }

  destroy (activeListener) {
    if (this._isObservation()) {
      this._activeListenerIds.forEach(observer => observer.disconnect())
    } else {
      this.activeListeners.forEach(activeListener => {
        this._element.removeEventListener(...this._getRemoveArgs(activeListener))
      })
    }

    return this
  }

  /* Private methods */
  _getId = function(listener, optionsOrUseCapture) {
    const id = { listener }

    if (is.object(optionsOrUseCapture) && optionsOrUseCapture.hasOwnProperty('capture')) {
      id.options = { capture: optionsOrUseCapture.capture }
    } else if (is.boolean(optionsOrUseCapture)) {
      id.useCapture = optionsOrUseCapture
    }

    return id
  }
  _getRemoveArgs = function(activeListener) {
    const { listener, options, useCapture } = activeListener
    return [listener, options, useCapture].filter(a => !!a)
  }
}
