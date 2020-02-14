/*
 * Copyable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

/* Dependencies */

/* Util */

export default class Copyable {
  constructor (string, options = {}) {
    /* Options */

    /* Public properties */
    this.string = string

    /* Private properties */
    this._computedStatus = 'ready'

    /* Dependency */
  }

  /* Public getters */
  get status () {
    return this._computedStatus
  }

  /* Public methods */
  setString (string) {
    this.string = string
    return this
  }

  async copy (options = {}) {
    const { usesFallback } = options
    
    if (usesFallback) {
      this._computedStatus = 'copying'
      this._writeTextFallback()
      this._computedStatus = 'copied'
    } else {
      this._computedStatus = 'copying'
      await navigator.clipboard.writeText(this.string)
      this._computedStatus = 'copied'
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
