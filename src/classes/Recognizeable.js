/*
 * Recognizeable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

/* Utils */
import { emit, is, toPolarCoordinates } from '../util'

/* Dependencies */
import objectPath from 'object-path'

const defaultOptions = {
  maxSequenceLength: true,
  handlers: {},
}

export default class Recognizeable {
  constructor (sequence, options = {}) {
    /* Options */
    options = {
      maxSequenceLength: true,
      ...options,
    }

    this._maxSequenceLength = is.defined(options.maxSequenceLength) ? options.maxSequenceLength : defaultOptions.maxSequenceLength
    this._handlers = is.defined(options.handlers) ? options.handlers : defaultOptions.handlers

    this._resetComputedMetadata()

    this.setSequence(sequence)

    this._handlerApi = {
      toPolarCoordinates,
      getStatus: () => this.status,
      getMetadata: () => this.metadata,
      // TODO: require object with appropriate properties on all methods below
      setMetadata: ({ path, value }) => this._setMetadata(path, value),
      pushMetadata: ({ path, value }) => this._pushMetadata(path, value),
      insertMetadata: ({ path, value, index }) => this._insertMetadata(path, value, index),
      recognized: () => this._recognized(),
      denied: () => this._denied(),
    }

    this._ready()
  }

  _resetComputedMetadata () {
    this._computedMetadata = objectPath({})
  }
  
  _recognized () {
    this._computedStatus = 'recognized'
  }
  _denied () {
    this._resetComputedMetadata()
    this._computedStatus = 'denied'
  }
  _ready () {
    this._computedStatus = 'ready'
  }

  _setMetadata (path, value) {
    this._computedMetadata.set(path, value)
  }
  _pushMetadata (path, value) {
    this._ensureArray(path, value)

    this._computedMetadata.push(path, value)
  }
  _insertMetadata (path, value, index) {
    this._ensureArray(path, value)
    this._computedMetadata.insert(path, value, index)
  }
  _ensureArray (path, value) {
    if (!is.array(this._computedMetadata.get(path))) {
      this._setMetadata(path, [])
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
    return this._computedMetadata.get()
  }

  setSequence (sequence) {
    this._computedSequence = sequence
    return this
  }

  recognize (event) {
    this._recognizing()

    const { type } = event,
          excess = is.number(this._maxSequenceLength)
            ? Math.max(0, this.sequence.length - this._maxSequenceLength)
            : 0,
          newSequence = [ ...this.sequence.slice(excess), event ]

    if (is.function(this._handlers[type])) {
      this._handlers[type]({ event,
        ...this._handlerApi,
        getSequence: () => newSequence,
      })
    }

    switch (this.status) {
    case 'denied':
      this.setSequence([]) // This specific line makes me think Recognizeable doesn't belong with the other classes
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
