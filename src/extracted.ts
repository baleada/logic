import {
  find,
  map,
  unique,
  some,
  toArray,
  pipe,
  join
} from 'lazy-collections'
import {
  createMap,
  Pipeable,
} from './pipes'
import {
  ListenableSupportedEventType,
  ListenEffect,
  ListenEffectParam,
  ListenOptions,
} from './classes/Listenable'

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
export function narrowKeycombo (type: string): ListenableKeycomboItem[] {
  return new Pipeable(type).pipe(
    toCombo,
    toListenableKeycomboItems
  ) as ListenableKeycomboItem[]
}

// export type ListenableMousecomboItem = ListenableModifier | ListenableModifierAlias | 'click'
export type ListenableMousecomboItem = string

export function narrowMousecombo (type: string): string[] {
  return toCombo(type)
}

export function narrowPointercombo (type: string): string[] {
  return toCombo(type)
}

const toUnique = unique<string>()
const toComboItems = map<string, string>(name => name === '' ? delimiter : name)
const delimiter = '+'
export function toCombo (type: string): string[] {
  // If the delimiter is used as a character in the type,
  // two empty strings will be produced by the split.
  // createUnique narrows those two are combined into one.
  return pipe(
    toUnique,
    toComboItems,
    toArray(),
  )(type.split(delimiter)) as string[]
}

export function fromComboItemNameToType (name: string) {
  return find((type: ListenableComboItemType) => predicatesByType[type](name))(listenableComboItemTypes) as ListenableComboItemType ?? 'custom'
}

export type ListenableComboItemType = 'singleCharacter' | 'arrow' | 'other' | 'modifier' | 'click' | 'pointer'

const listenableComboItemTypes = new Set<ListenableComboItemType>(['singleCharacter', 'arrow', 'other', 'modifier', 'click', 'pointer'])

const predicatesByType: Record<ListenableComboItemType, (name: string) => boolean> = {
  singleCharacter: name => typeREs['singleCharacter'].test(name),
  arrow: name => typeREs['arrow'].test(name),
  other: name => typeREs['other'].test(name),
  modifier: name => typeREs['modifier'].test(name),
  click: name => typeREs['click'].test(name),
  pointer: name => typeREs['pointer'].test(name),
}

const typeREs: Record<ListenableComboItemType, RegExp> = {
  singleCharacter: /^!?[a-zA-Z0-9,<.>/?;:'"[{\]}\\|`~!@#$%^&*()-_=+]$/,
  arrow: /^!?(arrow|vertical|horizontal|up|down|right|left)$/,
  other: /^!?(enter|backspace|space|tab|esc|home|end|pagedown|pageup|capslock|f[0-9]{1,2}|camera|delete)$/,
  modifier: /^!?(cmd|command|meta|shift|ctrl|control|alt|opt|option)$/,
  click: /^!?(rightclick|contextmenu|click|mousedown|mouseup|dblclick)$/,
  pointer: /^!?(pointerdown|pointerup|pointermove|pointerover|pointerout|pointerenter|pointerleave|pointercancel|gotpointercapture|lostpointercapture)$/,
}

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

export function createExceptAndOnlyEffect<Type extends ListenableSupportedEventType> (type: Type, effect: ListenEffect<Type>, options: ListenOptions<Type>): (param: ListenEffectParam<Type>) => void {
  const { except = [], only = [] } = options

  if (
    type === 'keydown'
    || type === 'keyup'
  ) {
    return ((event: ListenEffectParam<'keydown'>) => {
      const { target } = event,
            [matchesOnly, matchesExcept] = target instanceof Element
              ? createMap<string[], boolean>(selectors => some<string>(selector => target.matches(selector))(selectors) as boolean)([only, except])
              : [false, true]
  
      if (matchesOnly) {
        // @ts-ignore
        effect(event)
        return
      }
      
      if (only.length === 0 && !matchesExcept) {
        // @ts-ignore
        effect(event)
        return
      }
    }) as (param: ListenEffectParam<Type>) => void
  }
  
  if (
    type === 'click'
    || type === 'dblclick'
    || type === 'contextmenu'
    || type.startsWith('mouse')
  ) {
    return ((event: ListenEffectParam<'mousedown'>) => {
      const { target } = event,
            [matchesOnly, matchesExcept] = target instanceof Element
              ? createMap<string[], boolean>(selectors => some<string>(selector => target.matches(selector))(selectors) as boolean)([only, except])
              : [false, true]
  
      if (matchesOnly) {
        // @ts-ignore
        effect(event)
        return
      }
      
      if (only.length === 0 && !matchesExcept) {
        // @ts-expect-error
        effect(event)
        return
      }
    }) as (param: ListenEffectParam<Type>) => void
  }

  if (type.startsWith('pointer')) {
    return ((event: ListenEffectParam<'pointerdown'>) => {
      const { target } = event,
            [matchesOnly, matchesExcept] = target instanceof Element
              ? createMap<string[], boolean>(selectors => some<string>(selector => target.matches(selector))(selectors) as boolean)([only, except])
              : [false, true]
  
      if (matchesOnly) {
        // @ts-expect-error
        effect(event)
        return
      }
      
      if (only.length === 0 && !matchesExcept) {
        // @ts-expect-error
        effect(event)
        return
      }
    }) as (param: ListenEffectParam<Type>) => void
  }
  
  return ((event: ListenEffectParam<Type>) => {
    const { target } = event,
          [matchesOnly, matchesExcept] = target instanceof Element
            ? createMap<string[], boolean>(selectors => some<string>(selector => target.matches(selector))(selectors) as boolean)([only, except])
            : [false, true]

    if (matchesOnly) {
      // @ts-ignore
      effect(event, {})
      return
    }
    
    if (only.length === 0 && !matchesExcept) {
      // @ts-ignore
      effect(event, {})
      return
    }
  }) as (param: ListenEffectParam<Type>) => void
}

export function predicateModified<EventType extends KeyboardEvent | MouseEvent> ({ event, alias }: { event: EventType, alias: string }) {
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
export function predicateArray (value: unknown): value is any[] {
  return Array.isArray(value)
}

export function predicateUndefined (value: unknown): value is undefined {
  return value === undefined
}

export function predicateFunction (value: unknown): value is (...args: any[]) => any {
  return typeof value === 'function'
}

export function predicateNull (value: unknown): value is null {
  return value === null
}

export function predicateNumber (value: unknown): value is number {
  return typeof value === 'number'
}

export function predicateString (value: unknown): value is string {
  return typeof value === 'string'
}

// Adapted from React Aria https://github.com/adobe/react-spectrum/blob/b6786da906973130a1746b2bee63215bba013ca4/packages/%40react-aria/focus/src/FocusScope.tsx#L256
const tabbableSelector = join(':not([hidden]):not([tabindex="-1"]),')([
  'input:not([disabled]):not([type=hidden])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  'a[href]',
  'area[href]',
  'summary',
  'iframe',
  'object',
  'embed',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]',
  '[tabindex]:not([disabled])',
]) as string

export function predicateFocusable (element: HTMLElement): boolean {
  return element.matches(tabbableSelector)
}
