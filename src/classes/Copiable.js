/*
 * Copiable.js
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

/* Dependencies */

/* Util */

export default class Copiable {
  // _usesFallbacks
  // _computedSucceeded
  // _computedErrored

  constructor (string, options = {}) {
    /* Options */
    options = {
      usesFallbacks: false,
      ...options,
    }
    this._usesFallbacks = options.usesFallbacks

    /* Public properties */
    this.string = string

    /* Private properties */
    this._computedCopying = false

    /* Dependency */
  }

  /* Public getters */
  get copying () {
    return this._computedCopying
  }
  get copied () {
    // Boolean: this.string is equal to the clipboard text
  }

  /* Public methods */
  setString (string) {
    this.string = string
    return this
  }
  async copy () {
    if (this._usesFallbacks) {
      this._computedCopying = true
      this._writeTextFallback()
      this._computedCopying = false
    } else {
      this._computedCopying = true
      await navigator.clipboard.writeText(this.string)
      this._computedCopying = false
    }

    return this
  }

  /* Private methods */
  _writeTextFallback = function() {
    const input = document.createElement('input')
    input.type = 'text'
    input.value = this.string

    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')

    document.body.removeChild(input)
  }
}
