/*
 * syncable.js v1.0.0
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

import is from '../utils/is'
import { parse } from './parse.js'

// TODO: subclass Syncable for each type that requires special treatment

class Syncable {
  #intendedTypes
  #editsRawState
  #forcedType
  #currentKey
  #onSync
  #onCancel

  constructor(state, options) {
    this.state = state

    this.#intendedTypes = ['array', 'boolean', 'date', 'file', 'filelist', 'number', 'object', 'string']

    // Merge options with defaults
    options = {
      editsRawState: true,
      ...options
    }

    this.#forcedType = options.type
    this.#editsRawState = options.editsRawState
    this.#currentKey = options.currentKey
    this.#onSync = options.onSync
    this.#onCancel = options.onCancel

    this.editableState = this.#getEditableState()
  }

  // Getters and setters
  get type() {
    return is.string(this.#forcedType) ? this.#forcedType.toLowerCase() : this.#getType(this.state)
  }

  get editableStateType() {
    return this.#getType(this.editableState)
  }

  get formattedEditableState() {
    if (this.#typePairingIsSupported()) {
      if (this.editableStateType === 'string' && this.editableState.length > 0) {
        return this.editableState.trim()
      } else {
        return this.editableState
      }
    } else {
      if (!is.function(parse[this.type])) {
        throw new Error(`state/editableState type pairing (${this.type} and ${this.editableStateType}) is not supported`)
      } else {
        return parse[this.type](this.editableState)
      }
    }
  }


  // Utils
  setState (state) {
    this.state = state
    this.editableState = this.#getEditableState()
  }
  setEditableState (state) {
    this.editableState = state
  }
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
    if (this.#editsRawState) {
      return this.state
    } else if (this.type === 'object') {
      if (!this.state.hasOwnProperty(this.#currentKey)) {
        throw new Error('Cannot sync with object when editsRawState is false and object does not have the property indicated by the currentKey option.')
      } else {
        return this.state[this.#currentKey]
      }
    } else if (this.type === 'array') {
      return ''
    } else {
      throw new Error('When editsRawState is false, the Syncable state must be an array or an object.')
    }
  }
  #typePairingIsSupported = function() {
    return (
      (
        this.#editsRawState
        && this.type === this.editableStateType
      )
      || (
        !this.#editsRawState
        && ['array', 'object'].indexOf(this.type) !== -1
      )
    )
  }

  // Sync behaviors
  set newState (newState) {
    if (is.function(this.#onSync)) this.#onSync(newState)
  }

  // Cancel behaviors
  cancel () {
    this.editableState = this.#getEditableState()
    if (is.function(this.#onCancel)) this.#onCancel()
  }

  // Write behaviors
  write () {
    let newState // state clone that will be edited
    if (this.type === 'array') newState = this.#writeArray()
    else if (this.type === 'object') newState = this.#writeObject()
    else newState = this.formattedEditableState

    this.newState = newState
  }
  #writeArray = function() {
    if (this.#editsRawState) return this.formattedEditableState
    else {
      return this.state.concat([this.formattedEditableState])
    }
  }
  #writeObject = function() {
    if (this.#editsRawState) return this.formattedEditableState
    else {
      return {
        ...this.state,
        [this.#currentKey]: this.formattedEditableState,
      }
    }
  }

  // Erase behaviors
  erase (options) {
    options = { ...options }

    const newState = (this.type === 'array')
      ? this.#eraseArray(options)
      : (this.type === 'boolean')
        ? false
        : (this.type === 'date')
          ? new Date()
          :(this.type === 'number')
            ? 0
            : (this.type === 'object')
              ? this.#eraseObject(options)
              : (this.type === 'string')
                ? ''
                : null

    this.newState = newState
  }
  #eraseArray = function(options) {
    let newState = this.state // clone state

    if (['value', 'last', 'all'].every(property => !options.hasOwnProperty(property))) {
      throw new Error('Cannot erase array (erase function options do not have value, last, or all keys)')
    } else {
      if (options.hasOwnProperty('value')) {
        newState = this.state.filter(item => item !== options.value)
      }
      if (options.hasOwnProperty('last') && options.last !== false) {
        newState = this.state.slice(0, -1)
      }
      if (options.hasOwnProperty('all') && options.all !== false) {
        newState = []
      }
    }

    return newState
  }
  #eraseObject = function(options) {
    let newState = this.state // clone state

    if (['key', 'value', 'last', 'all'].every(property => !options.hasOwnProperty(property))) {
      throw new Error('Cannot erase array (options are undefined in erase function)')
    } else {
      if (options.hasOwnProperty('value')) {
        // TODO: What's the UI/feature/use case for deleting object values?
        let key = Object.keys(newState).find(key => newState[key] === options.value)
        newState[key] = undefined // TODO: what's the best null value to use here?
      }
      if (options.hasOwnProperty('key') && is.string(options.key)) {
        delete newState[options.key]
      }
      if (options.hasOwnProperty('last') && options.last !== false) {
        // TODO: What's the UI/feature/use case for deleting last key/value?
        delete newState[Object.keys(newState).reverse()[0]]
      }
      if (options.hasOwnProperty('all') && options.all !== false) {
        newState = {}
      }
    }

    return newState
  }

  // Transform behaviors
  transform (transform) {
    this.editableState = transform(this.editableState)
  }
}

export default Syncable
