import BezierEasing from 'bezier-easing'
import { createInsert, createUnique } from './pipes'
import mix from 'mix-css-color'

export function comboItemNameToType (name) {
  return [...guardsByType.keys()].find(type => guardsByType.get(type)(name)) ?? 'custom'
}

const guardsByType = new Map([
        [
          'singleCharacter',
          name => re.singleCharacter.test(name)
        ],
        [
          'arrow',
          name => re.arrow.test(name)
        ],
        [
          'other',
          name => re.other.test(name)
        ],
        [
          'modifier',
          name => re.modifier.test(name)
        ],
        [
          'click',
          name => re.click.test(name)
        ],
      ]),
      re = {
        singleCharacter: /^!?[a-zA-Z0-9,<.>/?;:'"[{\]}\\|`~!@#$%^&*()-_=+]$/,
        arrow: /^!?(arrow|vertical|horizontal|up|down|right|left)$/,
        other: /^!?(enter|backspace|space|tab|esc|home|end|pagedown|pageup|capslock|f[0-9]{1,2}|camera|delete)$/,
        modifier: /^!?(cmd|command|meta|shift|ctrl|control|alt|opt)$/,
        click: /^(rightclick|click|mousedown|mouseup)$/,
      }


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


export function createToAnimationProgress (points) {
  const { 0: { x: point1x, y: point1y }, 1: { x: point2x, y: point2y } } = points
  return BezierEasing(point1x, point1y, point2x, point2y)
}


export function domIsAvailable () {
  try {
    return isObject(window)
  } catch (error) {
    return false
  }
}


export function eventMatchesClickcombo ({ event, combo }) {
  return combo.every(name => (
    comboItemNameToType(name) === 'click'
    ||
    (name.startsWith('!') && !isModified({ alias: name.slice(1), event }))
    ||
    (!name.startsWith('!') && isModified({ alias: name, event }))
  ))
}



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
        return guardsByArrow[name]?.({ event, name }) ?? guardsByArrow.default({ event, name })
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

const guardsByArrow = {
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


export function guardUntilDelayed (naiveCallback) {
  function callback (frame) {
    const { data: { progress }, timestamp } = frame

    if (progress === 1) {
      naiveCallback(timestamp)
      this._delayed()
    } else {
      switch (this.status) {
      case 'ready':
      case 'paused':
      case 'sought':
      case 'delayed':
      case 'stopped':
        this._delaying()
        break
      }
    }
  }

  return callback
}

export function insert ({ object, path, value, index }) {
  const inserted = createInsert({ item: value, index })(get({ object, path }))
  
  set({ object, path, value: inserted })
}


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

export function isObject (value: unknown): value is object {
  return typeof value === 'object'
}

export function isString (value: unknown): value is string {
  return typeof value === 'string'
}


const guardsByModifier = {
  shift: event => event.shiftKey,
  cmd: event => event.metaKey,
  ctrl: event => event.ctrlKey,
  alt: event => event.altKey,
  opt: event => event.altKey,
}

export function isModified ({ event, alias }) {
  return guardsByModifier[alias]?.(event)
}


export function push ({ object, path, value }) {  
  const array = get({ object, path })
  set({ object, path, value: [...array, value] })
}


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

function toPath (keys) {
  return keys
    .map(key => typeof key === 'string' ? key : `${key}`)
    .reduce((path, key) => `${path}${'.' + key}`, '')
    .replace(/^\./, '')
}

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


export function toAddEventListenerParams (listener, options) {
  const { addEventListener, useCapture, wantsUntrusted } = options,
        exceptAndOnlyListener = createExceptAndOnlyListener(listener, options),
        listenerOptions = [addEventListener || useCapture, wantsUntrusted]

  return { exceptAndOnlyListener, listenerOptions }
}



export function toCategory (type) {
  return [...guardsByCategory.keys()]
    .find(category => guardsByCategory.get(category)(type))
}

const observationRE =/^(?:intersect|mutate|resize)$/,
      mediaQueryRE =/^\(.+\)$/,
      keycomboRE =/^((!?([a-zA-Z0-9,<.>/?;:'"[{\]}\\|`~!@#$%^&*()-_=+]|tab|space|arrow|vertical|horizontal|up|right|down|left|enter|backspace|esc|home|end|pagedown|pageup|capslock|f[0-9]{1,2}|camera|delete|cmd|command|meta|shift|ctrl|control|alt|opt))\+)*(!?([a-zA-Z0-9,<.>/?;:'"[{\]}\\|`~!@#$%^&*()-_=+]|tab|space|arrow|vertical|horizontal|up|right|down|left|enter|backspace|esc|home|end|pagedown|pageup|capslock|f[0-9]{1,2}|camera|delete|cmd|command|meta|shift|ctrl|control|alt|opt))$/,
      leftclickcomboRE =/^(!?((cmd|command|meta|shift|ctrl|control|alt|opt))\+){0,4}(click|mousedown|mouseup)$/,
      rightclickcomboRE =/^(!?((cmd|command|meta|shift|ctrl|control|alt|opt))\+){0,4}rightclick$/,
      guardsByCategory = new Map([
        [
          'recognizeable',
          type => type === 'recognizeable'
        ],
        [
          'observation',
          type => observationRE.test(type)
        ],
        [
          'mediaquery',
          type => mediaQueryRE.test(type)
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
          type => keycomboRE.test(type)
        ],
        [
          'leftclickcombo',
          type => leftclickcomboRE.test(type)
        ],
        [
          'rightclickcombo',
          type => rightclickcomboRE.test(type)
        ],
        [
          'event',
          () => true
        ]
      ])


export function toCombo (type, delimiter = '+') {
  // If the delimiter is used as a character in the type,
  // two empty strings will be produced by the split.
  // Uniqueable ensures those two are combined into one.
  return createUnique()(type.split(delimiter))
    .map(name => (name === '' ? delimiter : name))
}



export function toControlPoints(timing) {
  const { 0: point1x, 1: point1y, 2: point2x, 3: point2y } = timing
  
  return [
    { x: point1x, y: point1y },
    { x: point2x, y: point2y },
  ]
}

export function toEvent ({ combo, direction }, init) {
  const modifiers = combo.slice(0, combo.length - 1),
        { 0: name } = combo.slice(combo.length - 1),
        type = comboItemNameToType(name)

  switch (type) {
    case 'singleCharacter':
    case 'other':
    case 'modifier':
      return new KeyboardEvent(
        `key${direction}`,
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


export function toInterpolated ({ previous, next, progress }, options = {}) {
  if (isUndefined(previous)) {
    return next
  }

  const type = (isNumber(previous) && 'number') ||
    (isString(previous) && 'color') ||
    (isArray(previous) && 'array')

  return (() => {
    switch (type) {
      case 'number':
        return (next - previous) * progress + previous
      case 'color':
        return mix(previous, next, (1 - progress) * 100).hexa // No clue why this progress needs to be inverted, but it works
      case 'array':
        const sliceToExact = (next.length - previous.length) * progress + previous.length,
              nextIsLonger = next.length > previous.length,
              sliceTo = nextIsLonger ? Math.floor(sliceToExact) : Math.ceil(sliceToExact),
              shouldBeSliced = nextIsLonger ? next : previous
      return shouldBeSliced.slice(0, sliceTo)
    }
  })()
}


export function toKey (name) {
  return keysByName[name] ?? name
}

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
  camera: 'Camera',
  delete: 'Delete',
}


export function toKeys (path) {
  return path
    ? path
      .split('.')
      .map(key => isNaN(Number(key)) ? key : Number(key))
    : []
}


export function toLastMatch ({ string, expression, from }) {
  // VALIDATE: from is 0...string.length

  let indexOf
  if (!expression.test(string.slice(0, from)) || from === 0) {
    indexOf = -1
  } else {
    const reversedStringBeforeFrom = string
            .slice(0, from)
            .split('')
            .reverse()
            .join(''),
          toNextMatchIndex = toNextMatch({ string: reversedStringBeforeFrom, expression, from: 0 })
    
    indexOf = toNextMatchIndex === -1
      ? -1
      : (reversedStringBeforeFrom.length - 1) - toNextMatchIndex
  }

  return indexOf
}


const modifiersByAlias = {
  cmd: 'meta',
  command: 'meta',
  ctrl: 'control',
  opt: 'alt',
}

// type Alias = 'cmd' | 'command' | 'meta' | 'shift' | 'ctrl' | 'control' | 'alt' | 'opt'
// type Modifier = 'meta' | 'command' | 'control' | 'alt' | 'shift'

export function toModifier (alias) {
  return modifiersByAlias[alias] || alias
}


const flagsByAlias = {
  shift: 'shiftKey',
  cmd: 'metaKey',
  ctrl: 'ctrlKey',
  alt: 'altKey',
  opt: 'altKey',
}

export function toModifierFlag (alias) {
  return flagsByAlias[alias]
}


export function toNextMatch ({ string, expression, from }) {
  // VALIDATE: from is 0...string.length

  const searchResult = string.slice(from).search(expression),
        indexOf = searchResult === -1
          ? -1
          : from + searchResult

  return indexOf
}


export function toObserver ({ type, listener, options }) {
  switch (type) {
    case 'intersect':
      return new IntersectionObserver(listener, options)
    case 'mutate':
      return new MutationObserver(listener, options)
    case 'resize':
      return new ResizeObserver(listener, options)
  }
}


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


export function toReversedControlPoints (points) {
  return Array.from(points).reverse() // Reverse without mutating
    .map(({ x, y }) => ({ x: 1 - x, y: 1 - y })) // This easy reversal is why the control point objects are preferable
}


export function withDirectionCondition (direction, options) {
  const conditions = options.conditions || []

  return {
    ...options,
    conditions: [
      (event, store, { toDirection }) => toDirection(store.angle.degrees) === direction,
      ...conditions
    ],
  }
}
