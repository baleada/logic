import {
  isNull,
  isString,
  domIsAvailable,
} from '../util.js'

const defaultOptions: StoreableOptions = {
  type: 'local',
  statusKeySuffix: '_status',
}

export class Storeable {
  _type: 'local' | 'session'
  _statusKeySuffix: string
  constructor (key: string, options: StoreableOptions = {}) {
    this._constructing()
    this._type = options.type ?? defaultOptions.type
    this._statusKeySuffix = options.statusKeySuffix ?? defaultOptions.statusKeySuffix

    this.setKey(key)
    this._ready()
  }
  _constructing () {
    this._computedStatus = 'constructing'
  }
  _computedStatus: 'ready' | 'constructing' | 'stored' | 'errored' | 'removed'
  _ready () {
    this._computedStatus = 'ready'

    if (domIsAvailable()) {
      if (isNull(this.storage.getItem(this._computedStatusKey))) {
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
      if (this._computedStatus !== storedStatus && isString(storedStatus)) {
        this._computedStatus = /** @type {'ready' | 'constructing' | 'stored' | 'errored' | 'removed'} */ (storedStatus)
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

  _computedKey: string
  _computedStatusKey: string
  setKey (key: string) {
    let string
    switch (this.status) {
    case 'constructing':
    case 'ready':
      this._computedKey = key
      this._computedStatusKey = `${key}${this._statusKeySuffix}`
      break
    case 'stored':
      string = this.string
      this.remove()
      this.removeStatus()
      this._computedKey = key
      this._computedStatusKey = `${key}${this._statusKeySuffix}`
      this.store(string)
      break
    case 'removed':
      this.removeStatus()
      this._computedKey = key
      this._computedStatusKey = `${key}${this._statusKeySuffix}`
      this._removed()
      break
    }

    return this
  }

  _computedString: string
  _computedError: Error
  store (string: string) {
    try {
      this.storage.setItem(this.key, string)
      this._computedString = string // This assignment allows reactivity tools to detect data change
      this._stored()
    } catch (error) {
      this._computedError = error as Error
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

export type StoreableOptions = {
  type?: 'local' | 'session',
  statusKeySuffix?: string
}
