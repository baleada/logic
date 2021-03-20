import {
  toPolarCoordinates,
  get,
  set,
  push,
  insert,
  isArray,
  isNumber,
} from '../util.js'

/**
 * @type {RecognizeableOptions}
 */
const defaultOptions = {
  maxSequenceLength: true,
  handlers: {},
}

/**
 * @template {Event} T
 */
export class Recognizeable {
  /**
   * @typedef {object} RecognizeableHandlerApiConstructed
   * @property {toPolarCoordinates} toPolarCoordinates
   * @property {() => 'recognized' | 'recognizing' | 'denied' | 'ready'} getStatus
   * @property {(param?: { path: string }) => any} getMetadata
   * @property {(required: { path: string, value: any }) => void} setMetadata
   * @property {(required: { path: string, value: any }) => void} pushMetadata
   * @property {(required: { path: string, value: any, index: number }) => void} insertMetadata
   * @property {() => void} recognized
   * @property {() => void} denied
   * @property {(event: T) => any} listener
   */

  /**
   * @typedef {object} RecognizeableHandlerApiRuntime
   * @property {T} event
   * @property {() => T[]} getSequence
   */

  /**
   * @typedef {RecognizeableHandlerApiConstructed & RecognizeableHandlerApiRuntime} RecognizeableHandlerApi
   */

  /**
   * @param {T[]} sequence
   * @typedef {{ maxSequenceLength?: true | number, handlers?: Record<any, (handlerApi: RecognizeableHandlerApi) => any> }} RecognizeableOptions
   * @param {RecognizeableOptions} [options]
   */
  constructor (sequence, options = {}) {
    this._maxSequenceLength = options?.maxSequenceLength || defaultOptions.maxSequenceLength
    this._handlers = options?.handlers || defaultOptions.handlers

    this._resetComputedMetadata()

    this.setSequence(sequence)

    /**
     * @type {RecognizeableHandlerApiConstructed}
     */
    this._handlerApi = {
      toPolarCoordinates,
      getStatus: () => this.status,
      getMetadata: param => param ? get({ object: this.metadata, ...param }) : this.metadata,
      setMetadata: required => this._setMetadata(required),
      pushMetadata: required => this._pushMetadata(required),
      insertMetadata: required => this._insertMetadata(required),
      recognized: () => this._recognized(),
      denied: () => this._denied(),
      listener: event => this.listener?.(event),
    }

    this._ready()
  }

  _resetComputedMetadata () {
    /**
     * @type {Record<any, any>}
     */
    this._computedMetadata = {}
  }
  
  _recognized () {
    this._computedStatus = 'recognized'
  }
  _denied () {
    this._computedStatus = 'denied'
  }
  _ready () {
    /**
     * @type {'recognized' | 'recognizing' | 'denied' | 'ready'}
     */
    this._computedStatus = 'ready'
  }

  /**
   * @param {{ path: string, value: any }} required
   */
  _setMetadata ({ path, value }) {
    set({ object: this.metadata, path, value })
  }
  /**
   * @param {{ path: string, value: any }} required
   */
  _pushMetadata ({ path, value }) {
    this._ensureArray({ path })
    push({ object: this.metadata, path, value })
  }
  /**
   * @param {{ path: string, value: any, index: number }} required
   */
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
  get listener () {
    return this._computedListener
  }
  set listener (listener) {
    this.setListener(listener)
  }
  get status () {
    return this._computedStatus
  }
  get metadata () {
    return this._computedMetadata
  }

  /**
   * @param {T[]} sequence 
   */
  setSequence (sequence) {
    this._computedSequence = Array.from(sequence)
    return this
  }
  /**
   * @param {(event: T) => any} listener 
   */
  setListener (listener) {
    this._computedListener = listener
    return this
  }

  /**
   * @param {T} event 
   */
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
