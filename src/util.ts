import { createUnique } from './pipes'

// DISPATCHABLE
/**
 * 
 * @param {(ListenableKeyComboItemName | ListenableClickComboItemName)[]} combo 
 * @param {{ init?: EventInit, keyDirection?: 'up' | 'down' }} [options]
 */
export function toEvent (combo, options = {}) {
  const modifiers = combo.slice(0, combo.length - 1),
        { 0: name } = combo.slice(combo.length - 1),
        type = comboItemNameToType(name),
        { keyDirection, init } = options

  switch (type) {
    case 'singleCharacter':
    case 'other':
    case 'modifier':
      return new KeyboardEvent(
        `key${keyDirection}`,
        {
          ...init,
          key: toKey(name),
          ...modifiers.reduce((flags, alias) => ({ ...flags, [toModifierFlag(alias)]: true }), {})
        }
      )
    case 'click':
      return new MouseEvent(
        name === 'rightclick' ? 'contextmenu' : name,
        {
          ...init,
          ...modifiers.reduce((flags, alias) => ({ ...flags, [toModifierFlag(alias)]: true }), {})
        }
      )
    case 'custom':
      return new Event(
        name,
        init
      )
  }
}


// LISTENABLE
/**
 * @typedef {'intersect' | 'mutate' | 'resize'} ObserverType
 * @param {{ type: ObserverType, listener: (entries: any[]) => any }} required
 * @param {IntersectionObserverInit} [options]
 * @typedef {any} ResizeObserver
 * TODO: narrow when resize observer gets TS support
 * @return {IntersectionObserver | MutationObserver | ResizeObserver}
 */
export function toObserver ({ type, listener }, options) {
  switch (type) {
    case 'intersect':
      return new IntersectionObserver(listener, options)
    case 'mutate':
      return new MutationObserver(listener)
    case 'resize':
      // @ts-ignore
      return new ResizeObserver(listener)
  }
}

/**
 * @param {*} type 
 */
export function toCategory (type) {
  return [...predicatesByCategory.keys()]
    .find(category => predicatesByCategory.get(category)(type))
}

/**
 * @typedef {'recognizeable' | 'observation' | 'mediaquery' | 'idle' | 'visibilitychange' | 'keycombo' | 'leftclickcombo' | 'rightclickcombo' | 'event'} ListenableCategory
 * @typedef {string} ListenableType
 * @type {Map<ListenableCategory, (type: ListenableType) => boolean>}
 */
const predicatesByCategory = new Map([
  [
    'recognizeable',
    type => type === 'recognizeable'
  ],
  [
    'observation',
    type => categoryREs.observation.test(type)
  ],
  [
    'mediaquery',
    type => categoryREs.mediaQuery.test(type)
  ],
  [
    'idle',
    type => type === 'idle'
  ],
  [
    'visibilitychange',
    type => type === 'visibilitychange'
  ],
  [
    'keycombo',
    type => categoryREs.keycombo.test(type)
  ],
  [
    'leftclickcombo',
    type => categoryREs.leftclickcombo.test(type)
  ],
  [
    'rightclickcombo',
    type => categoryREs.rightclickcombo.test(type)
  ],
  [
    'event',
    () => true
  ]
])

/**
 * @type {{ observation: RegExp, mediaQuery: RegExp, keycombo: RegExp, leftclickcombo: RegExp, rightclickcombo: RegExp }}
 */
const categoryREs = {
  observation: /^(?:intersect|mutate|resize)$/,
  mediaQuery: /^\(.+\)$/,
  keycombo: /^((!?([a-zA-Z0-9,<.>/?;:'"[{\]}\\|`~!@#$%^&*()-_=+]|tab|space|arrow|vertical|horizontal|up|right|down|left|enter|backspace|esc|home|end|pagedown|pageup|capslock|f[0-9]{1,2}|camera|delete|cmd|command|meta|shift|ctrl|control|alt|opt))\+)*(!?([a-zA-Z0-9,<.>/?;:'"[{\]}\\|`~!@#$%^&*()-_=+]|tab|space|arrow|vertical|horizontal|up|right|down|left|enter|backspace|esc|home|end|pagedown|pageup|capslock|f[0-9]{1,2}|camera|delete|cmd|command|meta|shift|ctrl|control|alt|opt))$/,
  leftclickcombo: /^(!?((cmd|command|meta|shift|ctrl|control|alt|opt))\+){0,4}(click|mousedown|mouseup)$/,
  rightclickcombo: /^(!?((cmd|command|meta|shift|ctrl|control|alt|opt))\+){0,4}rightclick$/,
}

/**
 * 
 * @param {ListenableType} type
 * @param {string} [delimiter]
 * @return {ListenableClickComboItemName[]}
 */
export function toCombo (type, delimiter = '+') {
  // If the delimiter is used as a character in the type,
  // two empty strings will be produced by the split.
  // createUnique ensures those two are combined into one.
  return createUnique()(type.split(delimiter))
    .map(name => (name === '' ? delimiter : name))
}

// TODO: Better type
/**
 * @typedef {string} ListenableClickComboItemName
 * @param {ListenableClickComboItemName} name 
 */
export function comboItemNameToType (name) {
  return [...predicatesByType.keys()].find(type => predicatesByType.get(type)(name)) ?? 'custom'
}

/**
 * @typedef {'singleCharacter' | 'arrow' | 'other' | 'modifier' | 'click'} ListenableComboItemType
 * @type {Map<ListenableComboItemType, (name: ListenableClickComboItemName) => boolean>}
 */
const predicatesByType = new Map([
  [
    'singleCharacter',
    name => typeREs.singleCharacter.test(name)
  ],
  [
    'arrow',
    name => typeREs.arrow.test(name)
  ],
  [
    'other',
    name => typeREs.other.test(name)
  ],
  [
    'modifier',
    name => typeREs.modifier.test(name)
  ],
  [
    'click',
    name => typeREs.click.test(name)
  ],
])

/**
  * @type {{ singleCharacter: RegExp, arrow: RegExp, other: RegExp, modifier: RegExp, click: RegExp }}
  */
const typeREs = {
  singleCharacter: /^!?[a-zA-Z0-9,<.>/?;:'"[{\]}\\|`~!@#$%^&*()-_=+]$/,
  arrow: /^!?(arrow|vertical|horizontal|up|down|right|left)$/,
  other: /^!?(enter|backspace|space|tab|esc|home|end|pagedown|pageup|capslock|f[0-9]{1,2}|camera|delete)$/,
  modifier: /^!?(cmd|command|meta|shift|ctrl|control|alt|opt)$/,
  click: /^(rightclick|click|mousedown|mouseup)$/,
}

/**
 * 
 * @param {*} listener 
 * @param {*} options 
 */
 export function toAddEventListenerParams (listener, options) {
  const { addEventListener, useCapture, wantsUntrusted } = options,
        exceptAndOnlyListener = createExceptAndOnlyListener(listener, options),
        listenerOptions = [addEventListener || useCapture, wantsUntrusted]

  return { exceptAndOnlyListener, listenerOptions }
}

/**
 * 
 * @param {(event: any) => any} listener 
 * @param {{ except?: string[], only?: string[] }} options
 * @return {(event: any) => any}
 */
export function createExceptAndOnlyListener (listener, options) {
  const { except = [], only = [] } = options
  
  return event => {
    const { target } = event,
          [matchesOnly, matchesExcept] = [only, except].map(selectors => selectors.some(selector => target.matches(selector)))

    if (matchesOnly) {
      listener(event)
    } else if (only.length === 0 && !matchesExcept) {
      listener(event)
    }
  }
}

/**
 * @typedef {ListenableModifierAlias | string} ListenableKeyComboItemName
 * @typedef {{ name: ListenableKeyComboItemName, type: ListenableComboItemType }} ListenableKeyComboItem
 * @param {{ event: KeyboardEvent, combo: ListenableKeyComboItem[] }} required
 * @return {boolean}
 */
 export function eventMatchesKeycombo ({ event, combo }) {
  return combo.every(({ name, type }, index) => {
    switch (type) {
      case 'singleCharacter':
      case 'other':
        if (name === '!') {
          return event.key === '!'
        }

        return name.startsWith('!')
          ? event.key.toLowerCase() !== toKey(name).slice(1).toLowerCase()
          : event.key.toLowerCase() === toKey(name).toLowerCase()
      case 'arrow':
        return predicatesByArrow[name]?.({ event, name }) ?? predicatesByArrow.default({ event, name })
      case 'modifier':
        if (index === combo.length - 1) {
          return name.startsWith('!')
            ? event.key.toLowerCase() !== toModifier(name.slice(1)).toLowerCase()
            : event.key.toLowerCase() === toModifier(name).toLowerCase()
        }

        return name.startsWith('!')
          ? !isModified({ event, alias: name.slice(1) })
          : isModified({ event, alias: name })
    }
  })
}

/**
 * @typedef {'ArrowUp' | 'ArrowRight' | 'ArrowDown' | 'ArrowLeft' | 'Enter' | 'Backspace' | 'Tab' | ' ' | 'Shift' | 'Meta' | 'Meta' | 'Meta' | 'Control' | 'Control' | 'Alt' | 'Alt' | 'Fn' | 'CapsLock' | 'End' | 'Home' | 'PageDown' | 'PageUp' | 'Escape' | 'Camera' | 'Delete' | 'F1' | 'F2' | 'F3' | 'F4' | 'F5' | 'F6' | 'F7' | 'F8' | 'F9' | 'F10' | 'F11' | 'F12' | 'F13' | 'F14' | 'F15' | 'F16' | 'F17' | 'F18' | 'F19' | 'F20'} ListenableKey
 * @typedef {'up' | 'right' | 'down' | 'left' | 'enter' | 'backspace' | 'tab' | 'space' | 'shift' | 'meta' | 'command' | 'cmd' | 'control' | 'ctrl' | 'alt' | 'opt' | 'fn' | 'capslock' | 'end' | 'home' | 'pagedown' | 'pageup' | 'esc' | 'camera' | 'delete' | 'f1' | 'f2' | 'f3' | 'f4' | 'f5' | 'f6' | 'f7' | 'f8' | 'f9' | 'f10' | 'f11' | 'f12' | 'f13' | 'f14' | 'f15' | 'f16' | 'f17' | 'f18' | 'f19' | 'f20'} ListenableKeyAlias
 * @param {string} name 
 * @return {string}
 */
export function toKey (name) {
  return name in keysByName ? keysByName[name] : name
}

/**
 * @type {{'up': ListenableKey, 'right': ListenableKey, 'down': ListenableKey, 'left': ListenableKey, 'enter': ListenableKey, 'backspace': ListenableKey, 'tab': ListenableKey, 'space': ListenableKey, 'shift': ListenableKey, 'meta': ListenableKey, 'command': ListenableKey, 'cmd': ListenableKey, 'control': ListenableKey, 'ctrl': ListenableKey, 'alt': ListenableKey, 'opt': ListenableKey, 'fn': ListenableKey, 'capslock': ListenableKey, 'end': ListenableKey, 'home': ListenableKey, 'pagedown': ListenableKey, 'pageup': ListenableKey, 'esc': ListenableKey, 'camera': ListenableKey, 'delete': ListenableKey, 'f1': ListenableKey, 'f2': ListenableKey, 'f3': ListenableKey, 'f4': ListenableKey, 'f5': ListenableKey, 'f6': ListenableKey, 'f7': ListenableKey, 'f8': ListenableKey, 'f9': ListenableKey, 'f10': ListenableKey, 'f11': ListenableKey, 'f12': ListenableKey, 'f13': ListenableKey, 'f14': ListenableKey, 'f15': ListenableKey, 'f16': ListenableKey, 'f17': ListenableKey, 'f18': ListenableKey, 'f19': ListenableKey, 'f20': ListenableKey}}
 */
const keysByName = {
  up: 'ArrowUp',
  right: 'ArrowRight',
  down: 'ArrowDown',
  left: 'ArrowLeft',
  enter: 'Enter',
  backspace: 'Backspace',
  tab: 'Tab',
  space: ' ',
  shift: 'Shift',
  meta: 'Meta',
  command: 'Meta',
  cmd: 'Meta',
  control: 'Control',
  ctrl: 'Control',
  alt: 'Alt',
  opt: 'Alt',
  fn: 'Fn',
  capslock: 'CapsLock',
  end: 'End',
  home: 'Home',
  pagedown: 'PageDown',
  pageup: 'PageUp',
  esc: 'Escape',
  camera: 'Camera',
  delete: 'Delete',
  'f1': 'F1',
  'f2': 'F2',
  'f3': 'F3',
  'f4': 'F4',
  'f5': 'F5',
  'f6': 'F6',
  'f7': 'F7',
  'f8': 'F8',
  'f9': 'F9',
  'f10': 'F10',
  'f11': 'F11',
  'f12': 'F12',
  'f13': 'F13',
  'f14': 'F14',
  'f15': 'F15',
  'f16': 'F16',
  'f17': 'F17',
  'f18': 'F18',
  'f19': 'F19',
  'f20': 'F20',
}

/**
 * @typedef {(required: { event: KeyboardEvent, name?: string }) => boolean} ArrowPredicate
 * @type {{ arrow: ArrowPredicate, '!arrow': ArrowPredicate, vertical: ArrowPredicate, '!vertical': ArrowPredicate, horizontal: ArrowPredicate, '!horizontal': ArrowPredicate, default: ArrowPredicate }}
 */
const predicatesByArrow = {
  'arrow': ({ event }) => ['arrowup', 'arrowright', 'arrowdown', 'arrowleft'].includes(event.key.toLowerCase()),
  '!arrow': ({ event }) => !['arrowup', 'arrowright', 'arrowdown', 'arrowleft'].includes(event.key.toLowerCase()),
  'vertical': ({ event }) => ['arrowup', 'arrowdown'].includes(event.key.toLowerCase()),
  '!vertical': ({ event }) => !['arrowup', 'arrowdown'].includes(event.key.toLowerCase()),
  'horizontal': ({ event }) => ['arrowright', 'arrowleft'].includes(event.key.toLowerCase()),
  '!horizontal': ({ event }) => !['arrowright', 'arrowleft'].includes(event.key.toLowerCase()),
  'default': ({ event, name }) => name.startsWith('!')
    ? event.key.toLowerCase() !== `arrow${name.toLowerCase()}`
    : event.key.toLowerCase() === `arrow${name.toLowerCase()}`,
}


/**
 * @typedef {'cmd' | 'command' | 'meta' | 'shift' | 'ctrl' | 'control' | 'alt' | 'opt'} ListenableModifierAlias 
 * @typedef {'meta' | 'command' | 'control' | 'alt' | 'shift'} ListenableModifier
 * @param {string} alias
 * @return {ListenableModifier}
 */
export function toModifier (alias) {
  return modifiersByAlias[alias] || alias
}

/**
 * @type {{ cmd: ListenableModifier, command: ListenableModifier, ctrl: ListenableModifier, opt: ListenableModifier }}
 */
const modifiersByAlias = {
  cmd: 'meta',
  command: 'meta',
  ctrl: 'control',
  opt: 'alt',
}

/**
 * @typedef {'shiftKey' | 'metaKey' | 'ctrlKey' | 'altKey' | 'altKey'} ListenableModifierFlag
 * @param {string} alias
 * @return {ListenableModifierFlag}
 */
export function toModifierFlag (alias) {
  return flagsByAlias[alias]
}

/**
 * @type {{shift: ListenableModifierFlag, cmd: ListenableModifierFlag, ctrl: ListenableModifierFlag, alt: ListenableModifierFlag, opt: ListenableModifierFlag }}
 */
const flagsByAlias = {
  shift: 'shiftKey',
  cmd: 'metaKey',
  ctrl: 'ctrlKey',
  alt: 'altKey',
  opt: 'altKey',
}

/**
* @param {{ event: any, alias: string }} required
* @return {boolean}
*/
export function isModified ({ event, alias }) {
  return predicatesByModifier[alias]?.(event)
}

/**
 * @typedef {(event: any) => boolean} ListenableModifierPredicate
 * @type {{ shift: ListenableModifierPredicate, cmd: ListenableModifierPredicate, ctrl: ListenableModifierPredicate, alt: ListenableModifierPredicate, opt: ListenableModifierPredicate }}
 */
const predicatesByModifier = {
  shift: event => event.shiftKey,
  cmd: event => event.metaKey,
  ctrl: event => event.ctrlKey,
  alt: event => event.altKey,
  opt: event => event.altKey,
}


/**
 * @typedef {ListenableModifierAlias | 'click'} ListenableClickComboItem
 * @param {{ event: any, combo: ListenableClickComboItem[] }} required
 * @return {boolean}
 */
export function eventMatchesClickcombo ({ event, combo }) {
  return combo.every(name => (
    comboItemNameToType(name) === 'click'
    ||
    (name.startsWith('!') && !isModified({ alias: name.slice(1), event }))
    ||
    (!name.startsWith('!') && isModified({ alias: name, event }))
  ))
}


// STOREABLE
export function domIsAvailable (): boolean {
  try {
    return !!window
  } catch (error) {
    return false
  }
}


// PREDICATES
export function isArray (value: unknown): value is any[] {
  return Array.isArray(value)
}

export function isUndefined (value: unknown): value is undefined {
  return value === undefined
}

export function isFunction (value: unknown): value is (...args: any[]) => any {
  return typeof value === 'function'
}

export function isNull (value: unknown): value is null {
  return value === null
}

export function isNumber (value: unknown): value is number {
  return typeof value === 'number'
}

export function isObject (value: unknown): value is Record<any, any> {
  return typeof value === 'object'
}

export function isString (value: unknown): value is string {
  return typeof value === 'string'
}