/*
 * Recognizable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

/* Utils */
import { emit, toPolarCoordinates } from '../util'

export default class Recognizable {
  constructor (sequence, options = {}) {
    /* Options */
    options = {
      recognizesConsecutive: false,
      maxSequenceLenth: false,
      onRecognize: (newSequence, instance) => instance.setSequence(sequence),
      onDeny: (newSequence, instance) => instance.setSequence(sequence),
      initialState: {},
      ...options,
    }

    this._recognizesConsecutive = options.recognizesConsecutive
    this._maxSequenceLength = options.maxSequenceLength
    this._onRecognize = options.onRecognize
    this._onDeny = options.onDeny
    this._handlers = options.handlers
    this._initialState = options.initialState

    this.sequence = sequence

    this._handlerApi = {
      toPolarCoordinates,
      deny: () => this.deny(),
      recognized: () => this._recognized(),
      setState: (path, value) => this._setState(path, value),
      getState: path => this.state[path],
    }

    this.deny()
  }

  get status () {
    return this._computedStatus
  }
  get state () {
    return this._computedState
  }
  get lastEvent () {
    return this.sequence[this.sequence.length - 1]
  }

  setSequence (sequence) {
    this.sequence = sequence
    return this
  }
  recognize (event) {
    if (!this._recognizesConsecutive && this.status === 'recognized') {
      return this.deny()
    }

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

    emit(this._onRecognize, newSequence, this)

    return this
  }
  deny = function() {
    this._ready()
    this._computedState = this._initialState

    const newSequence = []
    emit(this._onDeny, newSequence, this)

    return this
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
  _setState = function(path, value) {
    const properties = path.split('.'),



    this._computedState[path] = value
  }
}
