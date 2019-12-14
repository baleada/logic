/*
 * Editable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

/* Util */
import { is, warn, typedEmit, hasProperties } from '../util'
import { editableTypes } from '../constants'

/* Libraries */
import Renamable from '../subclasses/Renamable'

class Editable {
  constructor (state, options = {}) {
    editableTypes =

    /* Options */
    options = {
      onEdit: (newState, instance) => instance.setState(newState),
      ...options
    }

    this._hardCodedType = options.type
    this._onEdit = options.onEdit
    this._onWrite = options.onWrite
    this._onErase = options.onErase

    this._writeDictionary = {
      array: options => this._writeArray(options),
      map: options => this._writeMap(options),
      object: options => this._writeObject(options),
    }
    this._eraseDictionary = {
      array: options => this._eraseArray(options),
      boolean: () => false,
      date: () => new Date(),
      map: options => this._eraseMap(options),
      number: () => 0,
      object: options => this._eraseObject(options),
      string: () => '',
    }

    /* Public properties */
    this.state = state
    this.editableState = this.state
  }

  /* Public getters */
  get type () {
    return this._getType(this.state)
  }

  /* Public methods */
  setState (state) {
    this.state = state
    this.setEditableState(state)
    return this
  }
  setEditableState (state) {
    this.editableState = state
    return this
  }
  cancel () {
    this._edit(this.state, 'cancel')
    return this
  }
  write (options = {}) {
    const newState = this._writeDictionary.hasOwnProperty(this.type)
      ? this._writeDictionary[this.type](options)
      : this.editableState

    return this._edit(newState, 'write')
  }
  erase (options = {}) {
    const newState = this._eraseDictionary.hasOwnProperty(this.type)
      ? this._eraseDictionary[this.type](options)
      : undefined

    return this._edit(newState, 'erase')
  }

  /* Private methods */
  _getType = function(state) {
    if (this._hardCodedType) {
      return this._hardCodedType
    } else {
      return this._guessType(state)
    }
  }
  _guessType = function(state) {
    let type,
        i = 0
    while (type === undefined && i < editableTypes.length) {
      if (is[editableTypes[i]](state)) {
        type = editableTypes[i]
      }
      i++
    }

    if (type === undefined) {
      type = 'unintended'
    }

    return type
  }
  _edit = function(newState, type) {
    typedEmit(
      newState,
      type,
      this,
      this._onEdit,
      [
        { type: 'write', emitter: this._onWrite },
        { type: 'erase', emitter: this._onErase },
      ]
    )

    return this
  }
  _writeArray = function(options) {
    // TODO: test this in a real app to see how the workflow feels.
    return options.hasOwnProperty('item')
      ? this.state.concat([options.item])
      : this.editableState
  }
  _writeMap = function(options) {
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

    if (hasProperties({ object: options, properties: ['rename', 'value'] })) {
      const renamable = new Renamable(newState),
            renamed = renamable.invoke(options.rename, key)

      renamed.set(key, options.value)

      newState = new Map(renamed)
    } else if (hasProperties({ object: options, properties: ['rename'] })) {
      const renamable = new Renamable(newState),
            renamed = renamable.invoke(options.rename, key)

      newState = new Map(renamed)
    } else if (hasProperties({ object: options, properties: ['value'] })) {
      newState.set(key, options.value)
    }

    return newState
  }
  _writeObject = function(options) {
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

    if (hasProperties({ object: options, properties: ['rename', 'value'] })) {
      newState[key] = options.value
      delete newState[options.rename]
    } else if (hasProperties({ object: options, properties: ['rename'] })) {
      newState[key] = newState[options.rename]
      delete newState[options.rename]
    } else if (hasProperties({ object: options, properties: ['value'] })) {
      newState[key] = options.value
    }

    return newState
  }
  _eraseArray = function(options) {
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
  _eraseMap = function(options) {
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
  _eraseObject = function(options) {
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
