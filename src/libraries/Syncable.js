/*
 * Syncable.js
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

import is from '../utils/is'
import { parse } from '../utils/parse'

// TODO: subclass Syncable for each type that requires special treatment?

class Syncable {
  /* Private properties */
  #intendedTypes
  #editsFullState
  #hardCodedType
  #currentKey
  #onSync
  #onCancel
  #writeDictionary
  #eraseDictionary

  constructor(state, options = {}) {
    this.#intendedTypes = ['array', 'boolean', 'date', 'file', 'filelist', 'number', 'object', 'string']

    /* Options */
    options = {
      editsFullState: true,
      ...options
    }

    this.#hardCodedType = options.type
    this.#editsFullState = options.editsFullState
    this.#currentKey = options.currentKey
    this.#onSync = options.onSync
    this.#onCancel = options.onCancel

    this.#writeDictionary = {
      array: () => this.#writeArray(),
      object: () => this.#writeObject(),
    }
    this.#eraseDictionary = {
      array: options => this.#eraseArray(options),
      boolean: () => false,
      date: () => new Date(),
      number: () => 0,
      object: options => this.#eraseObject(options),
      string: () => '',
    }

    /* Public properties */
    this.state = state
    this.editableState = this.#getEditableState()
  }

  /* Public getters */
  get type() {
    return this.#hardCodedType ? this.#hardCodedType.toLowerCase() : this.#getType(this.state)
  }
  get editableStateType() {
    return this.#getType(this.editableState)
  }
  get formattedEditableState() {
    let formattedEditableState

    if (this.#typePairingIsSupported()) {
      formattedEditableState = this.editableState
    } else if (!is.function(parse[this.type])) {
      throw new Error(`state/editableState type pairing (${this.type} and ${this.editableStateType}) is not supported`)
    } else {
      formattedEditableState = parse[this.type](this.editableState)
    }

    return formattedEditableState
  }

  /* Public methods */
  setState(state) {
    this.state = state
    this.setEditableState(this.#getEditableState())
    return this
  }
  setEditableState(state) {
    this.editableState = state
    return this
  }
  cancel() {
    this.editableState = this.#getEditableState()
    if (is.function(this.#onCancel)) this.#onCancel()
    return this
  }
  write() {
    const newState = this.#writeDictionary.hasOwnProperty(this.type)
      ? this.#writeDictionary[this.type]()
      : this.formattedEditableState

    return this.#sync(newState)
  }
  erase(options = {}) {
    const newState = this.#eraseDictionary.hasOwnProperty(this.type)
      ? this.#eraseDictionary[this.type](options)
      : null

    return this.#sync(newState)
  }

  /* Private methods */
  #getType = function(state) {
    let type,
        i = 0
    while (type === undefined && i < this.#intendedTypes.length) {
      if (is[this.#intendedTypes[i]](state)) type = this.#intendedTypes[i]
      i++
    }

    if (type === undefined) type = 'unintended'

    return type
  }

  #getEditableState = function() {
    if (this.#editsFullState) {
      return this.state
    } else if (this.type === 'object') {
      switch (true) {
        case !this.state.hasOwnProperty(this.#currentKey):
          throw new Error('Cannot sync with object when editsFullState is false and object does not have the property indicated by the currentKey option.')
          break
        default:
          return this.state[this.#currentKey]
      }
    } else if (this.type === 'array') {
      return ''
    } else {
      throw new Error('When editsFullState is false, the Syncable state must be an array or an object.')
    }
  }

  #typePairingIsSupported = function() {
    return (
      (
        this.#editsFullState
        && this.type === this.editableStateType
      )
      || (
        !this.#editsFullState
        && ['array', 'object'].includes(this.type)
      )
    )
  }

  #sync = function(newState) {
    if (is.function(this.#onSync)) this.#onSync(newState)
    return this
  }

  #writeArray = function() {
    return this.#editsFullState
      ? this.formattedEditableState
      : this.state.concat([this.formattedEditableState])
  }

  #writeObject = function() {
    return this.#editsFullState
      ? this.formattedEditableState
      : { ...this.state, [this.#currentKey]: this.formattedEditableState }
  }

  #eraseArray = function(options) {
    let newState = this.state // clone state

    if (['value', 'last', 'all'].every(property => !options.hasOwnProperty(property))) throw new Error('Cannot erase array (erase function options do not have value, last, or all keys)')

    if (options.hasOwnProperty('value')) newState = this.state.filter(item => item !== options.value)
    if (options.hasOwnProperty('last') && options.last !== false) newState = this.state.slice(0, -1)
    if (options.hasOwnProperty('all') && options.all !== false) newState = []

    return newState
  }

  #eraseObject = function(options) {
    let newState = this.state // clone state

    if (['key', 'value', 'last', 'all'].every(property => !options.hasOwnProperty(property))) throw new Error('Cannot erase array (options are undefined in erase function)')

    if (options.hasOwnProperty('value')) {
      // TODO: What's the UI/feature/use case for deleting object values?
      let key = Object.keys(newState).find(key => newState[key] === options.value)
      newState[key] = undefined // TODO: what's the best null value to use here?
    }
    if (options.hasOwnProperty('key') && is.string(options.key)) delete newState[options.key]
    if (options.hasOwnProperty('last') && options.last !== false) delete newState[Object.keys(newState).reverse()[0]] // TODO: What's the UI/feature/use case for deleting last key/value?
    if (options.hasOwnProperty('all') && options.all !== false) newState = {}

    return newState
  }
}

export default Syncable
