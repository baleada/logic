/*
 * Syncable.js
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

/* Utils */
import is from '../utils/is'
import { hasEveryProperty } from '../utils/hasProperties'
import warn from '../utils/warn'

/* Libraries */
import Renamable from '../subclasses/Renamable'

class Syncable {
  /* Private properties */
  #intendedTypes
  #editsFullArray
  #hardCodedType
  #onSync
  #onCancel
  #writeDictionary
  #eraseDictionary

  constructor (state, options = {}) {
    this.#intendedTypes = ['array', 'boolean', 'date', 'file', 'filelist', 'map', 'number', 'object', 'string']

    /* Options */
    options = {
      editsFullArray: true,
      ...options
    }

    this.#hardCodedType = options.type
    this.#editsFullArray = options.editsFullArray
    this.#onSync = options.onSync
    this.#onCancel = options.onCancel

    this.#writeDictionary = {
      array: () => this.#writeArray(),
      map: options => this.#writeMap(options),
      object: options => this.#writeObject(options),
    }
    this.#eraseDictionary = {
      array: options => this.#eraseArray(options),
      boolean: () => false,
      date: () => new Date(),
      map: options => this.#eraseMap(options),
      number: () => 0,
      object: options => this.#eraseObject(options),
      string: () => '',
    }

    /* Public properties */
    this.state = state
    this.editableState = this.#getEditableState()
  }

  /* Public getters */
  get type () {
    return this.#getType(this.state)
  }
  get editableStateType () {
    return this.#getType(this.editableState)
  }

  /* Public methods */
  setState (state) {
    this.state = state
    this.setEditableState(this.#getEditableState())
    return this
  }
  setEditableState (state) {
    this.editableState = state
    return this
  }
  cancel () {
    this.editableState = this.#getEditableState()
    if (is.function(this.#onCancel)) {
      this.#onCancel()
    }
    return this
  }
  write (options = {}) {
    const newState = this.#writeDictionary.hasOwnProperty(this.type)
      ? this.#writeDictionary[this.type](options)
      : this.editableState

    return this.#sync(newState)
  }
  erase (options = {}) {
    const newState = this.#eraseDictionary.hasOwnProperty(this.type)
      ? this.#eraseDictionary[this.type](options)
      : null

    return this.#sync(newState)
  }

  /* Private methods */
  #getType = function(state) {
    if (this.#hardCodedType && this.#hardCodedType !== 'array') {
      return this.#hardCodedType
    } else {
      return this.#guessType(state)
    }
  }
  #guessType = function(state) {
    let type,
        i = 0
    while (type === undefined && i < this.#intendedTypes.length) {
      if (is[this.#intendedTypes[i]](state)) {
        type = this.#intendedTypes[i]
      }
      i++
    }

    if (type === undefined) {
      type = 'unintended'
    }

    return type
  }
  #getEditableState = function() {
    if (this.type !== 'array') {
      return this.state
    } else {
      return this.#editsFullArray ? this.state : ''
    }
  }
  #sync = function(newState) {
    if (is.function(this.#onSync)) {
      this.#onSync(newState)
    }
    return this
  }
  #writeArray = function() {
    return this.#editsFullArray
      ? this.editableState
      : this.state.concat([this.editableState])
  }
  #writeMap = function(options) {
    warn('hasRequiredOptions', {
      received: options,
      required: ['key'],
      subject: 'Syncable\'s write method',
      docs: 'https://baleada.netlify.com/docs/logic/Syncable',
    })
    warn('hasRequiredOptions', {
      received: options,
      required: ['value', 'rename'],
      subject: 'Syncable\'s write method',
      docs: 'https://baleada.netlify.com/docs/logic/Syncable',
    })

    let newState = this.state
    const key = options.key

    if (hasEveryProperty(options, ['rename', 'value'])) {
      const renamable = new Renamable(newState)

      renamable.renameKey(options.rename, key)
      renamable.set(key, options.value)

      newState = new Map(renamable)
    } else if (hasEveryProperty(options, ['rename'])) {
      const renamable = new Renamable(newState)

      renamable.renameKey(options.rename, key)

      newState = new Map(renamable)
    } else if (hasEveryProperty(options, ['value'])) {
      newState.set(key, options.value)
    }

    return newState
  }
  #writeObject = function(options) {
    warn('hasRequiredOptions', {
      received: options,
      required: ['key'],
      subject: 'Syncable\'s write method',
      docs: 'https://baleada.netlify.com/docs/logic/Syncable',
    })
    warn('hasRequiredOptions', {
      received: options,
      required: ['value', 'rename'],
      subject: 'Syncable\'s write method',
      docs: 'https://baleada.netlify.com/docs/logic/Syncable',
    })

    const newState = this.state,
          key = options.key

    if (hasEveryProperty(options, ['rename', 'value'])) {
      newState[key] = options.value
      delete newState[options.rename]
    } else if (hasEveryProperty(options, ['rename'])) {
      newState[key] = newState[options.rename]
      delete newState[options.rename]
    } else if (hasEveryProperty(options, ['value'])) {
      newState[key] = options.value
    }

    return newState
  }
  #eraseArray = function(options) {
    warn('hasRequiredOptions', {
      received: options,
      required: ['value', 'last', 'all'],
      subject: 'Syncable\'s erase method',
      docs: 'https://baleada.netlify.com/docs/logic/Syncable',
    })

    let newState = this.state

    if (options.hasOwnProperty('value')) {
      newState = this.state.filter(item => item !== options.value)
    }
    if (options.hasOwnProperty('last') && options.last !== false) {
      newState = this.state.slice(0, -1)
    }
    if (options.hasOwnProperty('all') && options.all !== false) {
      newState = []
    }

    return newState
  }
  #eraseMap = function(options) {
    warn('hasRequiredOptions', {
      received: options,
      required: ['key', 'last', 'all'],
      subject: 'Syncable\'s erase method',
      docs: 'https://baleada.netlify.com/docs/logic/Syncable',
    })

    const newState = this.state

    if (options.hasOwnProperty('key') && is.string(options.key)) {
      newState.delete(options.key)
    }
    if (options.hasOwnProperty('last') && options.last !== false) {
      const last = Array.from(newState.keys()).reverse()[0]
      newState.delete(last) // TODO: What's the UI/feature/use case for deleting last key/value?
    }
    if (options.hasOwnProperty('all') && options.all !== false) {
      newState.clear()
    }

    return newState
  }
  #eraseObject = function(options) {
    warn('hasRequiredOptions', {
      received: options,
      required: ['value', 'last', 'all'],
      subject: 'Syncable\'s erase method',
      docs: 'https://baleada.netlify.com/docs/logic/Syncable',
    })

    let newState = this.state

    if (options.hasOwnProperty('key') && is.string(options.key)) {
      delete newState[options.key]
    }
    if (options.hasOwnProperty('last') && options.last !== false) {
      delete newState[Object.keys(newState).reverse()[0]] // TODO: What's the UI/feature/use case for deleting last key/value?
    }
    if (options.hasOwnProperty('all') && options.all !== false) {
      newState = {}
    }

    return newState
  }
}

export default Syncable
