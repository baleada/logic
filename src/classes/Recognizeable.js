/*
 * Recognizeable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

/* Utils */
import {
  toPolarCoordinates,
  get,
  set,
  push,
  insert,
  isArray,
  isNumber,
} from '../util'

const defaultOptions = {
  maxSequenceLength: true,
  handlers: {},
}

export default class Recognizeable {
  constructor (sequence, options = {}) {
    this._maxSequenceLength = options?.maxSequenceLength || defaultOptions.maxSequenceLength
    this._handlers = options?.handlers || defaultOptions.handlers

    this._resetComputedMetadata()

    this.setSequence(sequence)

    this._handlerApi = {
      toPolarCoordinates,
      getStatus: () => this.status,
      getMetadata: (param) => param ? get({ object: this.metadata, ...param }) : this.metadata,
      setMetadata: (...args) => this._setMetadata(...args),
      pushMetadata: (...args) => this._pushMetadata(...args),
      insertMetadata: (...args) => this._insertMetadata(...args),
      recognized: () => this._recognized(),
      denied: () => this._denied(),
    }

    this._ready()
  }

  _resetComputedMetadata () {
    this._computedMetadata = {}
  }
  
  _recognized () {
    this._computedStatus = 'recognized'
  }
  _denied () {
    this._computedStatus = 'denied'
  }
  _ready () {
    this._computedStatus = 'ready'
  }

  _setMetadata ({ path, value }) {
    set({ object: this.metadata, path, value })
  }
  _pushMetadata ({ path, value }) {
    this._ensureArray({ path })
    push({ object: this.metadata, path, value })
  }
  _insertMetadata ({ path, value, index }) {
    this._ensureArray({ path })
    insert({ object: this.metadata, path, value, index })
  }
  _ensureArray ({ path }) {
    const currentValue = (() => {
      try {
        return get({ object: this.metadata, path })
      } catch (error) {
        return undefined
      }
    })()

    if (!isArray(currentValue)) {
      this._setMetadata({ path, value: [] })
    }
  }

  get sequence () {
    return this._computedSequence
  }
  set sequence (sequence) {
    this.setSequence(sequence)
  }
  get status () {
    return this._computedStatus
  }
  get metadata () {
    return this._computedMetadata
  }

  setSequence (sequence) {
    this._computedSequence = Array.from(sequence)
    return this
  }

  recognize (event) {
    this._recognizing()

    const { type } = event,
          excess = isNumber(this._maxSequenceLength)
            ? Math.max(0, this.sequence.length - this._maxSequenceLength)
            : 0,
          newSequence = [ ...this.sequence.slice(excess), event ]

    this._handlers[type]?.({
      event,
      ...this._handlerApi,
      getSequence: () => newSequence,
    })
      

    switch (this.status) {
      case 'denied':
        this._resetComputedMetadata()
        this.setSequence([])
        break
      case 'recognizing':
      case 'recognized':
        this.setSequence(newSequence)
        break
    }

    return this
  }
  _recognizing () {
    this._computedStatus = 'recognizing'
  }
}
