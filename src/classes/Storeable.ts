import {
  isNull,
  isString,
  domIsAvailable,
} from '../extracted'

export type StoreableOptions = {
  kind?: 'local' | 'session',
  statusKeySuffix?: string
}

export type StoreableStatus = 'ready' | 'constructing' | 'stored' | 'errored' | 'removed'

const defaultOptions: StoreableOptions = {
  kind: 'local',
  statusKeySuffix: ' status',
}

export class Storeable<String extends string> {
  private kind: 'local' | 'session'
  private statusKeySuffix: string
  constructor (key: string, options: StoreableOptions = {}) {
    this.constructing()
    this.kind = options.kind ?? defaultOptions.kind
    this.statusKeySuffix = options.statusKeySuffix ?? defaultOptions.statusKeySuffix

    this.setKey(key)
    this.ready()
  }
  private constructing () {
    this.computedStatus = 'constructing'
  }
  private computedStatus: StoreableStatus
  private ready () {
    this.computedStatus = 'ready'

    if (domIsAvailable()) {
      if (isNull(this.storage.getItem(this.computedStatusKey))) {
        this.storeStatus()
      }
    }
  }

  get key () {
    return this.computedKey
  }
  set key (key) {
    this.setKey(key)
  }
  get status () {
    if (domIsAvailable()) {
      const storedStatus = this.storage.getItem(this.computedStatusKey)
      if (this.computedStatus !== storedStatus && isString(storedStatus)) {
        this.computedStatus = (storedStatus as 'ready' | 'constructing' | 'stored' | 'errored' | 'removed')
      }
    }

    return this.computedStatus
  }
  get storage () {
    switch (this.kind) {
    case 'local':
      return localStorage
    case 'session':
      return sessionStorage
    }
  }
  get string () {
    return this.storage.getItem(this.key) as String
  }
  get error () {
    return this.computedError
  }

  private computedKey: string
  private computedStatusKey: string
  setKey (key: string) {
    let string
    switch (this.status) {
    case 'constructing':
    case 'ready':
      this.computedKey = key
      this.computedStatusKey = `${key}${this.statusKeySuffix}`
      break
    case 'stored':
      string = this.string
      this.remove()
      this.removeStatus()
      this.computedKey = key
      this.computedStatusKey = `${key}${this.statusKeySuffix}`
      this.store(string)
      break
    case 'removed':
      this.removeStatus()
      this.computedKey = key
      this.computedStatusKey = `${key}${this.statusKeySuffix}`
      this.removed()
      break
    }

    return this
  }

  private computedString: String
  private computedError: Error
  store (string: String) {
    try {
      this.storage.setItem(this.key, string)
      this.computedString = string // This assignment allows reactivity tools to detect data change
      this.stored()
    } catch (error) {
      this.computedError = error as Error
      this.errored()
    }
    
    return this
  }
  private stored () {
    this.computedStatus = 'stored'
    this.storeStatus()
  }
  private errored () {
    this.computedStatus = 'errored'
    this.storeStatus()
  }
  private storeStatus () {
    this.storage.setItem(this.computedStatusKey, this.computedStatus)
  }

  remove () {
    this.storage.removeItem(this.key)
    this.removed()
    return this
  }
  private removed () {
    this.computedStatus = 'removed'
    this.storeStatus()
  }

  removeStatus () {
    this.storage.removeItem(this.computedStatusKey)
    return this
  }
}
