/*
* Copyable.js
* (c) 2019-present Alex Vipond
* Released under the MIT license
*/

import Resolveable from './Resolveable.js'

export default class Copyable {
  constructor (string, options = {}) {
    this.setString(string)
    this._computedCopied = new Resolveable(() => navigator.clipboard.readText())
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
  // TODO: Test this, including in firefox
  get copied () {
    return this._computedCopied.resolve()
  }
  
  setString (string) {
    this._computedString = string
    return this
  }
  
  async copy (options = {}) {    
    const { type = '' } = options

    switch (type) {

    }
    
    if (type) {
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
  _writeTextFallback () {
    const input = document.createElement('input')
    input.type = 'text'
    input.value = this.string
    
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    
    document.body.removeChild(input)
  }
}
