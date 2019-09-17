/*
 * Copiable.js
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

/* Dependencies */

/* Util */
import warn from '../util/warn'

export default class Copiable {
  #usesFallbacks
  #computedClipboard
  #computedSucceeded
  #computedErrored

  constructor (string, options = {}) {
    /* Options */
    options = {
      usesFallbacks: false,
      ...options,
    }
    this.#usesFallbacks = options.usesFallbacks

    /* Public properties */
    this.string = string

    /* Private properties */
    this.#computedClipboard = navigator.clipboard
    this.#computedSucceeded = false
    this.#computedErrored = false
    /* Dependency */
  }

  /* Public getters */
  get clipboard () {
    return this.#computedClipboard
  }
  get copied () {
    return this.#getCopied
  }
  get succeeded () {
    return this.#computedSucceeded
  }
  get errored () {
    return this.#computedErrored
  }

  /* Public methods */
  setString (string) {
    this.string = string
    return this
  }
  copy () {
    if (this.#usesFallbacks) {
      this.#writeTextFallback()
      this.#computedErrored = false
      this.#computedSucceeded = true
    } else {
      this.#writeText()
        .then(() => {
          this.#computedErrored = false
          this.#computedSucceeded = true
        })
        .catch(() => {
          this.#computedErrored = true
          this.#computedSucceeded = false
        })
    }

    return this
  }

  /* Private methods */
  #getCopied = function() {
    if (this.#usesFallbacks) {
      warn('noFallbackAvailable', {
        subject: 'Copiable\'s copied property'
      })
    } else {
      return this.#readText()
        .then(text => text)
    }
  }
  #readText = function() {
    return this.clipboard.readText()
  }
  #writeText = function() {
    return this.clipboard.writeText(this.string)
  }
  #writeTextFallback = function() {
    const input = document.createElement('input')
    input.type = 'text'
    input.value = this.string

    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')

    document.body.removeChild(input)
  }
}
