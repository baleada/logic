import {
  find as lazyCollectionFind,
  map as lazyCollectionMap,
  unique as lazyCollectionUnique,
  some as lazyCollectionSome,
  toArray as lazyCollectionToArray,
  pipe as lazyCollectionPipe,
} from 'lazy-collections'
import {
  createSlice,
  createReduce,
  createMap,
  Pipeable,
} from './pipes'
import type { ListenableKeycombo, ListenableSupportedEventType, ListenHandle, ListenHandleParam, ListenOptions } from './classes/Listenable'

// DISPATCHABLE
type ToEventOptions<Type extends ListenableSupportedEventType> = Type extends ListenableKeycombo
  ? { keyDirection?: 'up' | 'down', init?: EventInit }
  : { init?: EventInit }
export function toEvent<Type extends ListenableSupportedEventType> (combo: string[], options: ToEventOptions<Type> = {}) {
  const modifiers = createSlice<string>({ from: 0, to: combo.length - 1 })(combo) as (ListenableModifier | ListenableModifierAlias)[],
        { 0: name } = createSlice<string>({ from: combo.length - 1 })(combo),
        type = fromComboItemNameToType(name)

  switch (type) {
    case 'singleCharacter':
    case 'other':
    case 'modifier':
      return new KeyboardEvent(
        'keyDirection' in options ? `key${options.keyDirection}` : 'keydown',
        {
          ...(options.init || {}),
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
          ...(options.init || {}),
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
        (options.init || {})
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

export type ListenableKeycomboItem = {
  name: string,
  type: ListenableComboItemType | 'custom'
}

const toListenableKeycomboItems = createMap<string, ListenableKeycomboItem>(name => ({ name, type: fromComboItemNameToType(name) }))
export function ensureKeycombo (type: string): ListenableKeycomboItem[] {
  return new Pipeable(type).pipe(
    toCombo,
    toListenableKeycomboItems
  ) as ListenableKeycomboItem[]
}

// export type ListenableClickcomboItem = ListenableModifier | ListenableModifierAlias | 'click'
export type ListenableClickcomboItem = string

export function ensureClickcombo (type: string): string[] {
  return toCombo(type)
}

export function ensurePointercombo (type: string): string[] {
  return toCombo(type)
}

const unique = lazyCollectionUnique<string>()
const toComboItems = lazyCollectionMap<string, string>(name => name === '' ? DELIMITER : name)
const DELIMITER = '+'
export function toCombo (type: string): string[] {
  // If the delimiter is used as a character in the type,
  // two empty strings will be produced by the split.
  // createUnique ensures those two are combined into one.
  return lazyCollectionPipe(
    unique,
    toComboItems,
    lazyCollectionToArray(),
  )(type.split(DELIMITER)) as string[]
}

export function fromComboItemNameToType (name: string) {
  return lazyCollectionFind((type: ListenableComboItemType) => predicatesByType.get(type)(name))(listenableComboItemTypes) as ListenableComboItemType ?? 'custom'
}

export type ListenableComboItemType = 'singleCharacter' | 'arrow' | 'other' | 'modifier' | 'click' | 'pointer'

const listenableComboItemTypes = new Set<ListenableComboItemType>(['singleCharacter', 'arrow', 'other', 'modifier', 'click', 'pointer'])

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
  [
    'pointer',
    name => typeREs.get('pointer').test(name)
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
    /^!?(cmd|command|meta|shift|ctrl|control|alt|opt|option)$/
  ],
  [
    'click',
    /^!?(rightclick|contextmenu|click|mousedown|mouseup|dblclick)$/
  ],
  [
    'pointer',
    /^!?(pointerdown|pointerup|pointermove|pointerover|pointerout|pointerenter|pointerleave|pointercancel|gotpointercapture|lostpointercapture)$/
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
  return flagsByModifierOrAlias[modifierOrAlias]
}

const flagsByModifierOrAlias: Record<ListenableModifier | ListenableModifierAlias, ListenableModifierFlag> = {
  shift: 'shiftKey',
  cmd: 'metaKey',
  command: 'metaKey',
  meta: 'metaKey',
  ctrl: 'ctrlKey',
  control: 'ctrlKey',
  alt: 'altKey',
  opt: 'altKey',
  option: 'altKey',
}

export function createExceptAndOnlyHandle<Type extends ListenableSupportedEventType> (handle: ListenHandle<Type>, options: ListenOptions<Type>): ListenHandle<Type> {
  const { except = [], only = [] } = options
  
  return ((event: ListenHandleParam<Type>) => {
    const { target } = event,
          [matchesOnly, matchesExcept] = target instanceof Element
            ? [only, except].map(selectors => lazyCollectionSome<string>(selector => target.matches(selector))(selectors) as boolean)
            : [false, true]

    if (matchesOnly) {
      // @ts-ignore
      handle(event)
      return
    }
    
    if (only.length === 0 && !matchesExcept) {
      // @ts-ignore
      handle(event)
      return
    }
  }) as ListenHandle<Type>
}

export function isModified<EventType extends KeyboardEvent | MouseEvent> ({ event, alias }: { event: EventType, alias: string }) {
  return predicatesByModifier[alias]?.(event)
}

const predicatesByModifier: Record<ListenableModifier | ListenableModifierAlias, Function> = {
  shift: <EventType extends KeyboardEvent | MouseEvent>(event: EventType): boolean => event.shiftKey,
  cmd: <EventType extends KeyboardEvent | MouseEvent>(event: EventType): boolean => event.metaKey,
  command: <EventType extends KeyboardEvent | MouseEvent>(event: EventType): boolean => event.metaKey,
  meta: <EventType extends KeyboardEvent | MouseEvent>(event: EventType): boolean => event.metaKey,
  ctrl: <EventType extends KeyboardEvent | MouseEvent>(event: EventType): boolean => event.ctrlKey,
  control: <EventType extends KeyboardEvent | MouseEvent>(event: EventType): boolean => event.ctrlKey,
  alt: <EventType extends KeyboardEvent | MouseEvent>(event: EventType): boolean => event.altKey,
  opt: <EventType extends KeyboardEvent | MouseEvent>(event: EventType): boolean => event.altKey,
  option: <EventType extends KeyboardEvent | MouseEvent>(event: EventType): boolean => event.altKey,
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

export function isString (value: unknown): value is string {
  return typeof value === 'string'
}
