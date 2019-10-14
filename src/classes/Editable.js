/*
 * Editable.js
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

/* Util */
import is from '../util/is'
import { hasEveryProperty } from '../util/hasProperties'
import warn from '../util/warn'
import typedEmit from '../util/typedEmit'

/* Libraries */
import Renamable from '../subclasses/Renamable'

class Editable {
  /* Private properties */
  #intendedTypes
  #editsFullArray
  #hardCodedType
  #onEdit
  #onWrite
  #onErase
  #writeDictionary
  #eraseDictionary

  constructor (state, options = {}) {
    this.#intendedTypes = ['array', 'boolean', 'date', 'file', 'filelist', 'map', 'number', 'object', 'string']

    /* Options */
    options = {
      editsFullArray: true,
      onEdit: (newState, instance) => instance.setState(newState),
      ...options
    }

    this.#hardCodedType = options.type
    this.#editsFullArray = options.editsFullArray
    this.#onEdit = options.onEdit
    this.#onWrite = options.onWrite
    this.#onErase = options.onErase

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
    return this
  }
  write (options = {}) {
    const newState = this.#writeDictionary.hasOwnProperty(this.type)
      ? this.#writeDictionary[this.type](options)
      : this.editableState


    return this.#edit(newState, 'write')
  }
  erase (options = {}) {
    const newState = this.#eraseDictionary.hasOwnProperty(this.type)
      ? this.#eraseDictionary[this.type](options)
      : undefined

    return this.#edit(newState, 'erase')
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
  #edit = function(newState, type) {
    typedEmit(
      newState,
      type,
      this,
      this.#onEdit,
      [
        { type: 'write', emitter: this.#onWrite },
        { type: 'erase', emitter: this.#onErase },
      ]
    )

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
      subject: 'Editable\'s write method',
      docs: 'https://baleada.netlify.com/docs/logic/classes/Editable',
    })
    warn('hasRequiredOptions', {
      received: options,
      required: ['value', 'rename'],
      subject: 'Editable\'s write method',
      docs: 'https://baleada.netlify.com/docs/logic/classes/Editable',
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
      subject: 'Editable\'s write method',
      docs: 'https://baleada.netlify.com/docs/logic/classes/Editable',
    })
    warn('hasRequiredOptions', {
      received: options,
      required: ['value', 'rename'],
      subject: 'Editable\'s write method',
      docs: 'https://baleada.netlify.com/docs/logic/classes/Editable',
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
      required: ['item', 'last', 'all'],
      subject: 'Editable\'s erase method',
      docs: 'https://baleada.netlify.com/docs/logic/classes/Editable',
    })

    let newState = this.state

    if (options.hasOwnProperty('item')) {
      if (is.string(options.item)) {
        const item = options.item
        options.item = currentItem => currentItem === item
      }

      newState = newState.filter(currentItem => !options.item(currentItem)) // TODO: Offer a way to choose which match or matches get removed
    }
    if (options.hasOwnProperty('last') && options.last !== false) {
      newState = newState.slice(0, -1)
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
      subject: 'Editable\'s erase method',
      docs: 'https://baleada.netlify.com/docs/logic/classes/Editable',
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
      subject: 'Editable\'s erase method',
      docs: 'https://baleada.netlify.com/docs/logic/classes/Editable',
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

export default Editable
