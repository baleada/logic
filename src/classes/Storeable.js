/**
* Storeable.js
* (c) 2019-present Alex Vipond
* Released under the MIT license
**/

/* Utils */
import { is, domIsAvailable } from '../util'

const defaultOptions = {
  type: 'local'
}

export default class Storeable {
  constructor (key, options = {}) {
    this._type = is.defined(options.type) ? options.type : defaultOptions.type

    this.setKey(key)
    this._computedError = {}
    this._ready()
  }
  _ready () {
    this._computedStatus = 'ready'

    if (domIsAvailable()) {
      if (is.null(this.storage.getItem(this._computedStatusKey))) {
        this._storeStatus()
      }
    }
  }

  get key () {
    return this._computedKey
  }
  set key (key) {
    this.setKey(key)
  }
  get status () {
    if (domIsAvailable()) {
      const storedStatus = this.storage.getItem(this._computedStatusKey)
      if (this._computedStatus !== storedStatus) {
        this._computedStatus = storedStatus
      }
    }

    return this._computedStatus
  }
  get storage () {
    switch (this._type) {
    case 'local':
      return localStorage
    case 'session':
      return sessionStorage
    }
  }
  get string () {
    return this.storage.getItem(this.key)
  }
  get error () {
    return this._computedError
  }

  setKey (key) {
    let string
    switch (this.status) {
    case undefined:
    case 'ready':
      this._computedKey = key
      this._computedStatusKey = `${key}.status`
      break
    case 'stored':
      string = this.string
      this.remove()
      this.removeStatus(this._computedStatusKey)
      this._computedKey = key
      this._computedStatusKey = `${key}.status`
      this.store(string)
      break
    case 'removed':
      status = this.status
      this.removeStatus()
      this._computedKey = key
      this._computedStatusKey = `${key}.status`
      this._removed()
      break
    }

    return this
  }

  store (string) {
    try {
      this.storage.setItem(this.key, string)
      this._stored()
    } catch (error) {
      this._computedError = error
      this._errored()
    }
    
    return this
  }
  _stored () {
    this._computedStatus = 'stored'
    this._storeStatus()
  }
  _errored () {
    this._computedStatus = 'errored'
    this._storeStatus()
  }
  _storeStatus () {
    this.storage.setItem(this._computedStatusKey, this._computedStatus)
  }

  remove () {
    this.storage.removeItem(this.key)
    this._removed()
    return this
  }
  _removed () {
    this._computedStatus = 'removed'
    this._storeStatus()
  }

  removeStatus () {
    this.storage.removeItem(this._computedStatusKey)
    return this
  }
}
