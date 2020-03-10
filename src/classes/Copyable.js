/*
 * Copyable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

export default class Copyable {
  constructor (string, options = {}) {
    this.setString(string)
    this._ready()
  }
  _ready () {
    this._computedStatus = 'ready'
  }
  
  get string () {
    return this._computedString
  }
  set string (string) {
    this.setString(string)
  }
  get status () {
    return this._computedStatus
  }

  setString (string) {
    this._computedString = string
    return this
  }

  async copy (options = {}) {
    const { usesFallback } = options
    
    if (usesFallback) {
      this._copying()
      this._writeTextFallback()
      this._copied()
    } else {
      this._copying()
      await navigator.clipboard.writeText(this.string)
      this._copied()
    }

    return this
  }
  _copying () {
    this._computedStatus = 'copying'
  }
  _copied () {
    this._computedStatus = 'copied'
  }
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
