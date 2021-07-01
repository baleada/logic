import {
  find as lazyCollectionFind,
  map as lazyCollectionMap,
  unique as lazyCollectionUnique,
  pipe as lazyCollectionPipe
} from 'lazy-collections'
import {
  createSlice,
  createReduce,
} from './pipes'

// DISPATCHABLE
export function toEvent (
  combo: string[],
  options: { init?: EventInit, keyDirection?: 'up' | 'down' } = {}
) {
  const modifiers = createSlice<string>({ from: 0, to: combo.length - 1 })(combo) as (ListenableModifier | ListenableModifierAlias)[],
        { 0: name } = createSlice<string>({ from: combo.length - 1 })(combo),
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
          ...createReduce<ListenableModifier | ListenableModifierAlias, { [flag in ListenableModifierFlag]?: true }>(
            (flags, alias) => { 
              flags[toModifierFlag(alias)] = true
              return flags
            },
            {}
          )(modifiers)
        }
      )
    case 'click':
      return new MouseEvent(
        name === 'rightclick' ? 'contextmenu' : name,
        {
          ...init,
          ...createReduce<ListenableModifier | ListenableModifierAlias, { [flag in ListenableModifierFlag]?: true }>(
            (flags, alias) => { 
              flags[toModifierFlag(alias)] = true
              return flags
            },
            {}
          )(modifiers)
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
export function toKey (name: string | ListenableKeyAlias): string {
  return name in keysByName ? keysByName[name] : name
}

type ListenableKey = string
type ListenableKeyAlias = 'up' | 'right' | 'down' | 'left' | 'enter' | 'backspace' | 'tab' | 'space' | 'shift' | 'meta' | 'command' | 'cmd' | 'control' | 'ctrl' | 'alt' | 'opt' | 'option' | 'fn' | 'capslock' | 'end' | 'home' | 'pagedown' | 'pageup' | 'esc' | 'camera' | 'delete' | 'f1' | 'f2' | 'f3' | 'f4' | 'f5' | 'f6' | 'f7' | 'f8' | 'f9' | 'f10' | 'f11' | 'f12' | 'f13' | 'f14' | 'f15' | 'f16' | 'f17' | 'f18' | 'f19' | 'f20'

const keysByName: Record<ListenableKeyAlias, ListenableKey> = {
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
  option: 'Alt',
  fn: 'Fn',
  capslock: 'CapsLock',
  end: 'End',
  home: 'Home',
  pagedown: 'PageDown',
  pageup: 'PageUp',
  esc: 'Escape',
  camera: 'Camera',
  delete: 'Delete',
  f1: 'F1',
  f2: 'F2',
  f3: 'F3',
  f4: 'F4',
  f5: 'F5',
  f6: 'F6',
  f7: 'F7',
  f8: 'F8',
  f9: 'F9',
  f10: 'F10',
  f11: 'F11',
  f12: 'F12',
  f13: 'F13',
  f14: 'F14',
  f15: 'F15',
  f16: 'F16',
  f17: 'F17',
  f18: 'F18',
  f19: 'F19',
  f20: 'F20',
}

const unique = lazyCollectionUnique<string>()
const comboMap = lazyCollectionMap<string, string>(name => name === '' ? DELIMITER : name)
const DELIMITER = '+'
export function toCombo (type: string): string[] {
  // If the delimiter is used as a character in the type,
  // two empty strings will be produced by the split.
  // createUnique ensures those two are combined into one.
  return lazyCollectionPipe(
    unique,
    comboMap,
  )(type.split(DELIMITER)) as string[]
}

export function comboItemNameToType (name: string) {
  return lazyCollectionFind((type: ListenableComboItemType) => predicatesByType.get(type)(name))(LISTENABLE_COMBO_ITEM_TYPES) as ListenableComboItemType ?? 'custom'
}

export type ListenableComboItemType = 'singleCharacter' | 'arrow' | 'other' | 'modifier' | 'click'

const LISTENABLE_COMBO_ITEM_TYPES = new Set<ListenableComboItemType>(['singleCharacter', 'arrow', 'other', 'modifier', 'click'])

const predicatesByType: Map<ListenableComboItemType, (name: string) => boolean> = new Map([
  [
    'singleCharacter',
    name => typeREs.get('singleCharacter').test(name)
  ],
  [
    'arrow',
    name => typeREs.get('arrow').test(name)
  ],
  [
    'other',
    name => typeREs.get('other').test(name)
  ],
  [
    'modifier',
    name => typeREs.get('modifier').test(name)
  ],
  [
    'click',
    name => typeREs.get('click').test(name)
  ],
])

const typeREs: Map<ListenableComboItemType, RegExp> = new Map([
  [
    'singleCharacter',
    /^!?[a-zA-Z0-9,<.>/?;:'"[{\]}\\|`~!@#$%^&*()-_=+]$/
  ],
  [
    'arrow',
    /^!?(arrow|vertical|horizontal|up|down|right|left)$/
  ],
  [
    'other',
    /^!?(enter|backspace|space|tab|esc|home|end|pagedown|pageup|capslock|f[0-9]{1,2}|camera|delete)$/
  ],
  [
    'modifier',
    /^!?(cmd|command|meta|shift|ctrl|control|alt|opt)$/
  ],
  [
    'click',
    /^(rightclick|click|mousedown|mouseup)$/
  ],
])

export type ListenableModifierAlias = 'cmd' | 'command' | 'ctrl' | 'opt' | 'option'
export type ListenableModifier = 'meta' | 'command' | 'control' | 'alt' | 'shift'

export function toModifier (modifierOrAlias: ListenableModifier | ListenableModifierAlias) {
  return modifierOrAlias in modifiersByAlias ? modifiersByAlias[modifierOrAlias] : modifierOrAlias
}

const modifiersByAlias: Record<ListenableModifierAlias, ListenableModifier> = {
  cmd: 'meta',
  command: 'meta',
  ctrl: 'control',
  opt: 'alt',
  option: 'alt',
}

type ListenableModifierFlag = 'shiftKey' | 'metaKey' | 'ctrlKey' | 'altKey'

export function toModifierFlag (modifierOrAlias: ListenableModifier | ListenableModifierAlias) {
  return flagsByModifierOrAlias.get(modifierOrAlias)
}

const flagsByModifierOrAlias: Map<ListenableModifier | ListenableModifierAlias, ListenableModifierFlag> = new Map([
  ['shift', 'shiftKey'],
  ['cmd', 'metaKey'],
  ['command', 'metaKey'],
  ['meta', 'metaKey'],
  ['ctrl', 'ctrlKey'],
  ['control', 'ctrlKey'],
  ['alt', 'altKey'],
  ['opt', 'altKey'],
  ['option', 'altKey'],
])

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

export function isString (value: unknown): value is string {
  return typeof value === 'string'
}
