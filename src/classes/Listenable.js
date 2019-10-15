/*
 * Listenable.js
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

/* Dependencies */

/* Utils */
import is from '../util/is'

/* Dictionaries */
import touchEventDictionary from '../dictionaries/touchEvents'

export default class Listenable {
  #element
  #recognizerOptions
  #store
  #activeListenerIds
  #eventListenersGetter

  constructor (eventType, options = {}) {
    /* Options */
    options = {
      element: document,
      recognizer: {},
      ...options
    }

    this.#element = options.element
    this.#recognizerOptions = options.recognizer

    /* Public properties */
    this.eventType = eventType

    /* Private properties */
    this.#store = {}
    this.#activeListenerIds = []
    this.#eventListenersGetter = touchEventDictionary.hasOwnProperty(this.eventType)
      ? this.#getTouchEventListeners
      : (listener, options) => [[this.eventType, listener, ...options]]

    /* Dependency */
  }

  get activeListeners () {
    return this.#activeListenerIds
  }

  get eventData () {
    return this.#store
  }

  /* Public getters */

  /* Public methods */
  setEventType (eventType) {
    this.destroy()
    this.eventType = eventType
    return this
  }
  listen (listener, optionsOrUseCapture, wantsUntrusted) {
    const eventListeners = this.#getEventListeners(listener, optionsOrUseCapture, wantsUntrusted)

    eventListeners.forEach(eventListener => {
      this.#element.addEventListener(...eventListener)
      this.#activeListenerIds.push(this.#getId(eventListener))
    })

    return this
  }
  destroy (activeListener) {
    if (activeListener) {
      this.#element.removeEventListener(...this.#getRemoveArgs(activeListener))
    } else {
      this.activeListeners.forEach(activeListener => {
        this.#element.removeEventListener(...this.#getRemoveArgs(activeListener))
      })
    }

    return this
  }

  /* Private methods */
  #getEventListeners = function(listener, optionsOrUseCapture, wantsUntrusted) {
    const options = [optionsOrUseCapture, wantsUntrusted]
    return this.#eventListenersGetter(listener, options)
  }
  #getTouchEventListeners = function(listener, options) {
    return touchEventDictionary[this.eventType](listener, this.#store, this.#recognizerOptions)
      .map(eventListener => [...eventListener, ...options])
  }
  #getId = function(listener, optionsOrUseCapture) {
    const id = { listener }

    if (is.object(optionsOrUseCapture) && optionsOrUseCapture.hasOwnProperty('capture')) {
      id.options = { capture: optionsOrUseCapture.capture }
    } else if (is.boolean(optionsOrUseCapture)) {
      id.useCapture = optionsOrUseCapture
    }

    return id
  }
  #getRemoveArgs = function(activeListener) {
    const { listener, options, useCapture } = activeListener
    return [listener, options, useCapture].filter(a => !!a)
  }
}
