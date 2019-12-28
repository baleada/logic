/*
 * Recognizable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

/* Utils */
import { emit, toPolarCoordinates } from '../util'

/* Dependencies */
import objectPath from 'object-path'

export default class Recognizable {
  constructor (sequence, options = {}) {
    /* Options */
    options = {
      recognizesConsecutive: false,
      maxSequenceLenth: false,
      onRecognize: (newSequence, instance) => instance.setSequence(sequence),
      onDeny: (newSequence, instance) => instance.setSequence(sequence),
      initialMetadata: {},
      ...options,
    }

    this._recognizesConsecutive = options.recognizesConsecutive
    this._maxSequenceLength = options.maxSequenceLength
    this._onRecognize = options.onRecognize
    this._onDeny = options.onDeny
    this._handlers = options.handlers
    this._initialMetadata = options.initialMetadata

    this.sequence = sequence

    this._handlerApi = {
      toPolarCoordinates,
      deny: () => this.deny(),
      recognized: () => this._recognized(),
      setMetadata: (path, value) => this._setMetadata(path, value),
      getMetadata: path => this.state[path],
    }

    this._ready()
  }

  get status () {
    return this._computedStatus
  }
  get state () {
    return this._computedMetadata
  }
  get lastEvent () {
    return this.sequence[this.sequence.length - 1]
  }

  setSequence (sequence) {
    this.sequence = sequence
    return this
  }
  recognize (event) {
    // if (!this._recognizesConsecutive && this.status === 'recognized') {
    //   return this.deny()
    // }

    this._recognizing()

    const { type } = event,
          excess = typeof this._maxSequenceLength === 'number'
            ? Math.max(0, this.sequence.length - this._maxSequenceLength)
            : 0,
          newSequence = [ ...this.sequence.slice(excess), event ]

    if (typeof this._handlers[type] === 'function') {
      this._handlers[type](event, {
        ...this._handlerApi,
        sequence: newSequence,
      })
    }

    switch (true) {
    case this.status === 'denied':
      emit(this._onRecognize, [], this)
      break
    case this.status === 'recognized':
      emit(this._onRecognize, newSequence, this)
      break
    }

    emit(this._onRecognize, newSequence, this)

    return this
  }
  deny = function() {
    this._computedStatus = 'denied'
    this._computedMetadata = this._initialMetadata
  }
  _ready = function() {
    this._computedStatus = 'ready'
  }
  _recognizing = function() {
    this._computedStatus = 'recognizing'
  }
  _recognized = function() {
    this._computedStatus = 'recognized'
  }
  _setMetadata = function(path, value) {
    objectPath.set(this._computedMetadata, path, value)
  }
  _getMetadata = function(path) {
    return objectPath.get(this._computedMetadata, path)
  }
}
