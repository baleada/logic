/*
 * Listenable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

/* Dependencies */
import Recognizeable from './Recognizeable'
// METADATA: EXTERNAL object-path

/* Utils */
import is from '../util/is.js'

/* Factories */
import uniqueable from '../factories/uniqueable'

/* Constants */
import observers from '../constants/observers'
const mediaQueryRegexp = /^\(.+\)$/,
      keycomboRegexp = /^((!?([a-zA-Z0-9,<.>/?;:'"[{\]}\\|`~!@#$%^&*()-_=+]|tab|arrow|vertical|horizontal|up|right|down|left|enter|backspace|cmd|shift|ctrl|alt|opt))\+)*(!?([a-zA-Z0-9,<.>/?;:'"[{\]}\\|`~!@#$%^&*()-_=+]|tab|arrow|vertical|horizontal|up|right|down|left|enter|backspace|cmd|shift|ctrl|alt|opt))$/,
      leftclickcomboRegexp = /^(!?((cmd|shift|ctrl|alt|opt))\+){0,4}(click|mousedown|mouseup)$/,
      rightclickcomboRegexp = /^(!?((cmd|shift|ctrl|alt|opt))\+){0,4}rightclick$/,
      singleCharacter = /^!?[a-zA-Z0-9,<.>/?;:'"[{\]}\\|`~!@#$%^&*()-_=+]$/,
      arrowRegexp = /^!?(arrow|vertical|horizontal|up|down|right|left)$/,
      enterBackspaceTabRegexp = /^!?(enter|backspace|tab)$/,
      modifierRegexp = /^!?(cmd|shift|ctrl|alt|opt)$/,
      clickRegexp = /^(rightclick|click|mousedown|mouseup)$/,
      modifierAssertDictionary = {
        shift: event => event.shiftKey,
        cmd: event => event.metaKey,
        ctrl: event => event.ctrlKey,
        alt: event => event.altKey,
        opt: event => event.altKey,
      },
      modifierAliasDictionary = {
        shift: 'shift',
        cmd: 'meta',
        ctrl: 'control',
        alt: 'alt',
        opt: 'alt',
      },
      defaultOptions = {
        keycombo: 'down',
      }

export default class Listenable {
  constructor (eventType, options = {}) {
    if (eventType === 'recognizeable') {
      this._computedRecognizeable = new Recognizeable([], options.recognizeable)
      this._computedRecognizeableEvents = Object.keys(options.recognizeable.handlers || {}) // TODO: handle error for undefined handlers
    }

    // Has no effect if the type is not detected as keycombo
    this._keycomboType = options?.keycombo || defaultOptions.keycombo

    this._observer = observers[eventType]

    this._type = this._getType(eventType)

    this._computedActiveListeners = []

    this.setEventType(eventType)
    this._ready()
  }
  _ready () {
    this._computedStatus = 'ready'
  }

  _getType (eventType) {
    return (this._computedRecognizeable instanceof Recognizeable && 'recognizeable') ||
      (!!this._observer && 'observation') ||
      (mediaQueryRegexp.test(eventType) && 'mediaquery') ||
      (eventType === 'idle' && 'idle') ||
      (eventType === 'visibilitychange' && 'visibilitychange') ||
      (keycomboRegexp.test(eventType) && 'keycombo') ||
      (leftclickcomboRegexp.test(eventType) && 'leftclickcombo') ||
      (rightclickcomboRegexp.test(eventType) && 'rightclickcombo') ||
      'event'
  }

  get eventType () {
    return this._computedEventType
  }
  set eventType (eventType) {
    this.setEventType(eventType)
  }
  get status () {
    return this._computedStatus
  }
  get activeListeners () {
    return this._computedActiveListeners
  }
  get recognizeable () {
    return this._computedRecognizeable
  }

  setEventType (eventType) {
    this.stop()
    this._computedEventType = eventType
    return this
  }

  listen (listener, options = {}) {
    switch (this._type) {
    case 'observation':
      this._observationListen(listener, options)
      break
    case 'mediaquery':
      this._mediaQueryListen(listener, options)
      break
    case 'idle':
      this._idleListen(listener, options)
      break
    case 'recognizeable':
      this._recognizeableListen(listener, options)
      break
    case 'visibilitychange':
      this._visibilityChangeListen(listener, options)
      break
    case 'keycombo':
      this._keycomboListen(listener, options)
      break
    case 'leftclickcombo':
    case 'rightclickcombo':
      this._clickcomboListen(listener, options)
      break
    case 'event':
      this._eventListen(listener, options)
      break
    }

    this._listening()

    return this
  }
  _observationListen (listener, options) {
    const { observer: observerOptions, observe: observeOptions, target = document.querySelector('html') } = options,
          observerInstance = this._observer(listener, observerOptions)

    observerInstance.observe(target, observeOptions)
    this._computedActiveListeners.push({ target, id: observerInstance, type: 'observation' })
  }
  _mediaQueryListen (listener) {
    const target = window.matchMedia(this.eventType)

    target.addListener(listener)
    this._computedActiveListeners.push({ target, id: listener, type: 'mediaquery' })
  }
  _idleListen (listener, options) {
    const { requestIdleCallback = {} } = options,
          id = window.requestIdleCallback(listener, requestIdleCallback)

    this._computedActiveListeners.push({ id, type: 'idle' })
  }
  _recognizeableListen (listener, options) {
    const { exceptAndOnlyListener, listenerOptions } = this._getAddEventListenerSetup(listener, options),
          eventListeners = this._computedRecognizeableEvents.map(name => {
            return [name, event => {
              this._computedRecognizeable.recognize(event)

              if (this._computedRecognizeable.status === 'recognized') {
                exceptAndOnlyListener({ event, recognizeable: this.recognizeable })
              }
            }, ...listenerOptions]
          })

    this._addEventListeners(eventListeners, options)
  }
  _visibilityChangeListen (listener, naiveOptions) {
    const options = {
      ...naiveOptions,
      target: document,
    }
    
    this._eventListen(listener, options)
  }
  _keycomboListen (naiveListener, options) {
    const keys = uniqueable(this.eventType.split('+'))
            .unique()
            .map(name => ({ name: name === '' ? '+' : name, type: this._getKeyType(name) })),
          listener = event => {
            const matches = keys.every(({ name, type }, index) => {
              let matches
              switch (type) {
              case 'singleCharacter':
              case 'enterBackspaceTab':
                matches = name.startsWith('!') && name.length === 2
                  ? event.key.toLowerCase() !== name.toLowerCase()
                  : event.key.toLowerCase() === name.toLowerCase()
                break
              case 'arrow':
                switch (name) {
                case 'arrow':
                case '!arrow':
                  matches = name.startsWith('!')
                    ? !['arrowup', 'arrowright', 'arrowdown', 'arrowleft'].includes(event.key.toLowerCase())
                    : ['arrowup', 'arrowright', 'arrowdown', 'arrowleft'].includes(event.key.toLowerCase())
                  break
                case 'vertical':
                case '!vertical':
                  matches = name.startsWith('!')
                    ? !['arrowup', 'arrowdown'].includes(event.key.toLowerCase())
                    : ['arrowup', 'arrowdown'].includes(event.key.toLowerCase())
                  break
                case 'horizontal':
                case '!horizontal':
                  matches = name.startsWith('!')
                    ? !['arrowright', 'arrowleft'].includes(event.key.toLowerCase())
                    : ['arrowright', 'arrowleft'].includes(event.key.toLowerCase())
                  break
                default:
                  matches = name.startsWith('!')
                    ? event.key.toLowerCase() !== `arrow${name.toLowerCase()}`
                    : event.key.toLowerCase() === `arrow${name.toLowerCase()}`
                }
                break
              case 'modifier':
                if (index === keys.length - 1) {
                  matches = name.startsWith('!')
                    ? event.key.toLowerCase() !== modifierAliasDictionary[name].toLowerCase()
                    : event.key.toLowerCase() === modifierAliasDictionary[name].toLowerCase()
                } else {
                  matches = name.startsWith('!')
                    ? !modifierAssertDictionary[name](event)
                    : modifierAssertDictionary[name](event)
                }
                
                break
              }

              return matches
            })
            
            if (matches) {
              naiveListener(event)
            }
          }
    
    this._eventListen(listener, options)
  }
  _getKeyType (name) {
    return singleCharacter.test(name)
            ? 'singleCharacter'
            : arrowRegexp.test(name)
              ? 'arrow'
              : enterBackspaceTabRegexp.test(name)
                ? 'enterBackspaceTab'
                : modifierRegexp.test(name)
                  ? 'modifier'
                  : false // unreachable
  }
  _clickcomboListen (naiveListener, options) {
    const keys = this.eventType.split('+'),
          listener = event => {
            const matches = keys.every(key => clickRegexp.test(key) || (!key.startsWith('!') && modifierAssertDictionary[key](event)) || (key.startsWith('!') && !modifierAssertDictionary[key](event)))

            if (matches) {
              naiveListener(event)
            }
          }
    
    this._eventListen(listener, options)
  }
  _eventListen (listener, options) {
    let eventType
    switch (this._type) {
    case 'keycombo':
      eventType = `key${this._keycomboType}`
      break
    case 'leftclickcombo':
      eventType = this.eventType.match(/(\w+)$/)[1]
      break
    case 'rightclickcombo':
      eventType = 'contextmenu'
      break
    default:
      eventType = this.eventType
      break
    }

    const { exceptAndOnlyListener, listenerOptions } = this._getAddEventListenerSetup(listener, options),
          eventListeners = [[eventType, exceptAndOnlyListener, ...listenerOptions]]

    this._addEventListeners(eventListeners, options)
  }
  _getAddEventListenerSetup (listener, options) {
    const { addEventListener, useCapture, wantsUntrusted } = options,
          exceptAndOnlyListener = this._getExceptAndOnlyListener(listener, options),
          listenerOptions = [addEventListener || useCapture, wantsUntrusted]

    return { exceptAndOnlyListener, listenerOptions }
  }
  _getExceptAndOnlyListener (listener, options) {
    const { except = [], only = [] } = options

    function exceptAndOnlyListener (eventOrRecognizeableCallbackObject) {
      let target
      switch (this._type) {
      case 'recognizeable':
        target = eventOrRecognizeableCallbackObject.event.target
        break
      default:
        target = eventOrRecognizeableCallbackObject.target
        break
      }
      
      const [isOnly, isExcept] = [only, except].map(selectors => selectors.some(selector => target.matches(selector)))

      if (isOnly) { // Whitelist always wins
        listener(...arguments)
      } else if (only.length === 0 && !isExcept) { // Ignore blacklist when whitelist has elements
        listener(...arguments)
      }
    }

    return exceptAndOnlyListener.bind(this)
  }
  _addEventListeners (eventListeners, options) {
    const { target = document } = options

    eventListeners.forEach(eventListener => {
      target.addEventListener(...eventListener)
      this._computedActiveListeners.push({ target, id: eventListener, type: 'event' })
    })
  }
  _listening () {
    this._computedStatus = 'listening'
  }

  stop (target) {
    switch (this.status) {
    case 'ready':
    case undefined:
      // Do nothing. Don't use web APIs during construction or before doing anything else.
      break
    default:
      const stoppable = !!target
              ? this.activeListeners.filter(({ target: t }) => t === target) // Normally would use .isSameNode() here, but it needs to support MediaQueryLists too
              : this.activeListeners

      stoppable.forEach(({ target: t, id, type }) => {
        switch (true) {
        case type === 'observation':
          id.disconnect()
          break
        case type === 'mediaquery':
          t.removeListener(id)
          break
        case type === 'idle':
          window.cancelIdleCallback(id)
          break
        case type === 'event':
          t.removeEventListener(...id)
          break
        }
      })
      
      if (stoppable.length = this.activeListeners.length) {
        this._stopped()
      }
      break
    }

    return this
  }
  _stopped () {
    this._computedStatus = 'stopped'
  }
}
