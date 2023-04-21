import {
  find,
  map,
  unique,
  toArray,
  pipe,
} from 'lazy-collections'

export type { DeepRequired, Expand } from './types'

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

export { createExceptAndOnlyEffect } from './createExceptAndOnlyEffect'

export { getDomAvailability } from './getDomAvailability'

export {
  predicateArray,
  predicateUndefined,
  predicateFunction,
  predicateNull,
  predicateNumber,
  predicateString,
  predicateObject,
} from './predicates'

export { at, includes, length } from './lazy-collections'

// RECOGNIZEABLE EFFECTS
// Pipes
export { createPredicateKeycomboDown as createKeycomboIsDown } from './createKeycomboIsDown'
export type { KeyStatus, KeyStatuses } from './createKeycomboIsDown'

// Transforms
export { toDirection } from './toDirection'
export type { Direction } from './toDirection'

export { toHookApi } from './toHookApi'
export type { HookApi } from './toHookApi'

export { fromCodeToName as toName } from './fromCodeToName'

export { toMousePoint, toTouchMovePoint, toTouchEndPoint } from './toPoints'

export { toPolarCoordinates } from './toPolarCoordinates'
export type { PolarCoordinates } from './toPolarCoordinates'

// Store
export { storeKeyboardTimeMetadata } from './storeKeyboardTimeMetadata'
export type { KeyboardTimeMetadata } from './storeKeyboardTimeMetadata'

export { storePointerStartMetadata } from './storePointerStartMetadata'
export type { PointerStartMetadata } from './storePointerStartMetadata'

export { storePointerMoveMetadata } from './storePointerMoveMetadata'
export type { PointerMoveMetadata } from './storePointerMoveMetadata'

export { storePointerTimeMetadata } from './storePointerTimeMetadata'
export type { PointerTimeMetadata } from './storePointerTimeMetadata'


// Objects
export { narrowKeycombo } from './keycombo'
export type { KeycomboItem } from './keycombo'

export {
  defineGraph,
  defineGraphNodes,
  defineGraphEdges,
  defineAsyncGraph,
  defineGraphEdgesAsync,
} from './graph'
export type {
  Graph,
  GraphNode as GraphNode,
  GraphEdge,
  AsyncGraph,
  AsyncGraphEdge,
  GraphState,
  GraphStep,
  GraphCommonAncestor,
  GraphTreeNode,
} from './graph'

export { defineAssociativeArray } from './associative-array'
export type { AssociativeArray } from './associative-array'
