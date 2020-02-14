/*
 * Recognizeable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

/* Utils */
import { emit, is, toPolarCoordinates } from '../util'

/* Dependencies */
import objectPath from 'object-path'

export default class Recognizeable {
  constructor (sequence, options = {}) {
    /* Options */
    options = {
      maxSequenceLength: true,
      onRecognize: (newSequence, instance) => instance.setSequence(newSequence),
      onDeny: (newSequence, instance) => instance.setSequence(newSequence),
      initialMetadata: {},
      ...options,
    }

    this._maxSequenceLength = options.maxSequenceLength
    this._onRecognize = options.onRecognize
    this._onDeny = options.onDeny
    this._handlers = options.handlers || {}

    this._computedMetadata = objectPath(options.initialMetadata)

    this.sequence = sequence

    this._handlerApi = {
      toPolarCoordinates,
      recognized: () => this._recognized(),
      denied: () => this._denied(),
      getStatus: () => this.status,
      getLastEvent: () => this.lastEvent,
      getMetadata: () => this.metadata,
      setMetadata: ({ path, value }) => this._setMetadata(path, value),
      pushMetadata: ({ path, value }) => this._pushMetadata(path, value),
      insertMetadata: ({ path, value, index }) => this._insertMetadata(path, value, index),
    }

    this._ready()
  }
  
  _recognized () {
    this._computedStatus = 'recognized'
  }
  _denied () {
    this._computedMetadata = this._initialMetadata
    this._computedStatus = 'denied'
  }
  _setMetadata (path, value) {
    this._computedMetadata.set(path, value)
  }
  _pushMetadata (path, value) {
    this._computedMetadata.push(path, value)
  }
  _insertMetadata (path, value, index) {
    this._computedMetadata.insert(path, value, index)
  }
  _ready () {
    this._computedStatus = 'ready'
  }

  get status () {
    return this._computedStatus
  }
  get metadata () {
    return this._computedMetadata.get()
  }
  get lastEvent () {
    return this.sequence[this.sequence.length - 1]
  }

  setSequence (sequence) {
    this.sequence = sequence
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
      this._handlers[type](event, {
        ...this._handlerApi,
        sequence: newSequence,
      })
    }

    switch (this.status) {
    case 'denied':
      emit(this._onDeny, [], this)
      break
    case 'recognized':
      emit(this._onRecognize, newSequence, this)
      break
    default:
      // do nothing. Status remains 'recognizing' until explicitly recognized or denied by the handler
      break
    }

    return this
  }
  _recognizing () {
    this._computedStatus = 'recognizing'
  }
}
