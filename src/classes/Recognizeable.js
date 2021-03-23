import { isArray, isNumber } from '../util.js'
import { createInsert } from '../pipes.js'

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

/**
 * @param {{ xA: number, xB: number, yA: number, yB: number }} cartesian
 * @return {{ distance: number, angle: { radians: number, degrees: number } }}
 */
 export function toPolarCoordinates ({ xA, xB, yA, yB }) {
  const distance = Math.hypot(xB - xA, yB - yA),
        angle = Math.atan2((yA - yB), (xB - xA)),
        radians = angle >= 0
          ? angle
          : 2 * Math.PI + angle,
        degrees = radians * 180 / Math.PI

  return {
    distance,
    angle: { radians, degrees }
  }
}

/**
 * 
 * @param {{ object: Record<any, any>, path: string }} required
 * @return {any}
 */
export function get ({ object, path }) {
  return toKeys(path).reduce((gotten, key) => {
    if (!Array.isArray(gotten)) {
      return gotten[key]
    }

    return key === 'last'
      ? gotten[gotten.length - 1]
      : gotten[key]
  }, object)
}

/**
 * 
 * @param {string} path
 * @return {(string | number)[]}
 */
export function toKeys (path) {
  return path
    ? path
      .split('.')
      .map(key => isNaN(Number(key)) ? key : Number(key))
    : []
}

/**
 * 
 * @param {{ object: Record<any, any>, path: string, value: any }} required
 * @return {void}
 */
export function set ({ object, path, value }) {
  toKeys(path).forEach((key, index, array) => {
    if (array.length === 1) {
      object[key] = value
      return
    }

    const p = toPath(array.slice(0, index))

    if (!p) {
      maybeAssign({
        gotten: object[key],
        key,
        assign: value => (object[key] = value)
      })
    } else {
      maybeAssign({
        gotten: get({ object, path: p }),
        key,
        assign: value => set({ object, path: p, value })
      })
    }

    if (index === array.length - 1) {
      get({ object, path: p })[key] = value
    }
  })
}

/**
 * 
 * @param {(string | number)[]} keys
 * @return {string}
 */
 function toPath (keys) {
  return keys
    .map(key => typeof key === 'string' ? key : `${key}`)
    .reduce((path, key) => `${path}${'.' + key}`, '')
    .replace(/^\./, '')
}

/**
 * 
 * @param {{ gotten: any, key: string | number, assign: (value: any) => void }} required 
 * @return void
 */
 function maybeAssign ({ gotten, key, assign }) {
  if (gotten === undefined) {
    switch (typeof key) {
      case 'number':
        assign([])
      case 'string':
        assign({})
    }
  }
}

/**
 * 
 * @param {{ object: Record<any, any>, path: string, value: any }} required
 * @return {void}
 */
export function push ({ object, path, value }) {  
  const array = get({ object, path })
  set({ object, path, value: [...array, value] })
}

/**
 * 
 * @param {{ object: Record<any, any>, path: string, value: any, index: number }} required
 * @return {void}
 */
export function insert ({ object, path, value, index }) {
  const inserted = createInsert({ item: value, index })(get({ object, path }))
  
  set({ object, path, value: inserted })
}
