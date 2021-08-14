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
import { ListenableKeycombo, ListenableSupportedEventType, ListenEffect, ListenEffectParam, ListenOptions, toImplementation } from './classes/Listenable'
import { DispatchOptions } from './classes/Dispatchable'

// DISPATCHABLE
type ToEventOptions<EventType extends ListenableSupportedEventType> = EventType extends ListenableKeycombo
  ? { keyDirection?: 'up' | 'down', init?: DispatchOptions<EventType>['init'] }
  : { init?: DispatchOptions<EventType>['init'] }
export function toEvent<EventType extends ListenableSupportedEventType> (eventType: EventType, options: ToEventOptions<EventType> = {}): ListenEffectParam<EventType> {
  const implementation = toImplementation(eventType)

  switch (implementation) {
    case 'keycombo': {
      const combo = toCombo(eventType),
            modifiers = createSlice<string>({ from: 0, to: combo.length - 1 })(combo) as (ListenableModifier | ListenableModifierAlias)[],
            { 0: name } = createSlice<string>({ from: combo.length - 1 })(combo)
      
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
      ) as ListenEffectParam<EventType>
    }
    case 'leftclickcombo':
    case 'rightclickcombo': {
        const combo = toCombo(eventType),
              modifiers = createSlice<string>({ from: 0, to: combo.length - 1 })(combo) as (ListenableModifier | ListenableModifierAlias)[],
              { 0: name } = createSlice<string>({ from: combo.length - 1 })(combo)

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
      ) as ListenEffectParam<EventType>
    }
    case 'pointercombo': {
      const combo = toCombo(eventType),
            modifiers = createSlice<string>({ from: 0, to: combo.length - 1 })(combo) as (ListenableModifier | ListenableModifierAlias)[],
            { 0: name } = createSlice<string>({ from: combo.length - 1 })(combo)

      return new PointerEvent(
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
      ) as ListenEffectParam<EventType>
    }
    case 'documentevent':
    case 'event':
      // @ts-ignore  
      if (eventType === 'abort') return new UIEvent(options.init)
      // @ts-ignore
      if (eventType === 'animationcancel') return new AnimationEvent(options.init)
      // @ts-ignore
      if (eventType === 'animationend') return new AnimationEvent(options.init)
      // @ts-ignore
      if (eventType === 'animationiteration') return new AnimationEvent(options.init)
      // @ts-ignore
      if (eventType === 'animationstart') return new AnimationEvent(options.init)
      // @ts-ignore
      if (eventType === 'auxclick') return new MouseEvent(options.init)
      // @ts-ignore
      if (eventType === 'beforeinput') return new InputEvent(options.init)
      // @ts-ignore
      if (eventType === 'blur') return new FocusEvent(options.init)
      // @ts-ignore
      if (eventType === 'cancel') return new Event(options.init)
      // @ts-ignore
      if (eventType === 'canplay') return new Event(options.init)
      // @ts-ignore
      if (eventType === 'canplaythrough') return new Event(options.init)
      // @ts-ignore
      if (eventType === 'change') return new Event(options.init)
      // @ts-ignore
      if (eventType === 'click') return new MouseEvent(options.init)
      // @ts-ignore
      if (eventType === 'close') return new Event(options.init)
      // @ts-ignore
      if (eventType === 'compositionend') return new CompositionEvent(options.init)
      // @ts-ignore
      if (eventType === 'compositionstart') return new CompositionEvent(options.init)
      // @ts-ignore
      if (eventType === 'compositionupdate') return new CompositionEvent(options.init)
      // @ts-ignore
      if (eventType === 'contextmenu') return new MouseEvent(options.init)
      // @ts-ignore
      if (eventType === 'cuechange') return new Event(options.init)
      // @ts-ignore
      if (eventType === 'dblclick') return new MouseEvent(options.init)
      // @ts-ignore
      if (eventType === 'drag') return new DragEvent(options.init)
      // @ts-ignore
      if (eventType === 'dragend') return new DragEvent(options.init)
      // @ts-ignore
      if (eventType === 'dragenter') return new DragEvent(options.init)
      // @ts-ignore
      if (eventType === 'dragexit') return new Event(options.init)
      // @ts-ignore
      if (eventType === 'dragleave') return new DragEvent(options.init)
      // @ts-ignore
      if (eventType === 'dragover') return new DragEvent(options.init)
      // @ts-ignore
      if (eventType === 'dragstart') return new DragEvent(options.init)
      // @ts-ignore
      if (eventType === 'drop') return new DragEvent(options.init)
      // @ts-ignore
      if (eventType === 'durationchange') return new Event(options.init)
      // @ts-ignore
      if (eventType === 'emptied') return new Event(options.init)
      // @ts-ignore
      if (eventType === 'ended') return new Event(options.init)
      // @ts-ignore
      if (eventType === 'error') return new ErrorEvent(options.init)
      // @ts-ignore
      if (eventType === 'focus') return new FocusEvent(options.init)
      // @ts-ignore
      if (eventType === 'focusin') return new FocusEvent(options.init)
      // @ts-ignore
      if (eventType === 'focusout') return new FocusEvent(options.init)
      // @ts-ignore
      if (eventType === 'gotpointercapture') return new PointerEvent(options.init)
      // @ts-ignore
      if (eventType === 'input') return new Event(options.init)
      // @ts-ignore
      if (eventType === 'invalid') return new Event(options.init)
      // @ts-ignore
      if (eventType === 'keydown') return new KeyboardEvent(options.init)
      // @ts-ignore
      if (eventType === 'keypress') return new KeyboardEvent(options.init)
      // @ts-ignore
      if (eventType === 'keyup') return new KeyboardEvent(options.init)
      // @ts-ignore
      if (eventType === 'load') return new Event(options.init)
      // @ts-ignore
      if (eventType === 'loadeddata') return new Event(options.init)
      // @ts-ignore
      if (eventType === 'loadedmetadata') return new Event(options.init)
      // @ts-ignore
      if (eventType === 'loadstart') return new Event(options.init)
      // @ts-ignore
      if (eventType === 'lostpointercapture') return new PointerEvent(options.init)
      // @ts-ignore
      if (eventType === 'mousedown') return new MouseEvent(options.init)
      // @ts-ignore
      if (eventType === 'mouseenter') return new MouseEvent(options.init)
      // @ts-ignore
      if (eventType === 'mouseleave') return new MouseEvent(options.init)
      // @ts-ignore
      if (eventType === 'mousemove') return new MouseEvent(options.init)
      // @ts-ignore
      if (eventType === 'mouseout') return new MouseEvent(options.init)
      // @ts-ignore
      if (eventType === 'mouseover') return new MouseEvent(options.init)
      // @ts-ignore
      if (eventType === 'mouseup') return new MouseEvent(options.init)
      // @ts-ignore
      if (eventType === 'pause') return new Event(options.init)
      // @ts-ignore
      if (eventType === 'play') return new Event(options.init)
      // @ts-ignore
      if (eventType === 'playing') return new Event(options.init)
      // @ts-ignore
      if (eventType === 'pointercancel') return new PointerEvent(options.init)
      // @ts-ignore
      if (eventType === 'pointerdown') return new PointerEvent(options.init)
      // @ts-ignore
      if (eventType === 'pointerenter') return new PointerEvent(options.init)
      // @ts-ignore
      if (eventType === 'pointerleave') return new PointerEvent(options.init)
      // @ts-ignore
      if (eventType === 'pointermove') return new PointerEvent(options.init)
      // @ts-ignore
      if (eventType === 'pointerout') return new PointerEvent(options.init)
      // @ts-ignore
      if (eventType === 'pointerover') return new PointerEvent(options.init)
      // @ts-ignore
      if (eventType === 'pointerup') return new PointerEvent(options.init)
      // @ts-ignore
      if (eventType === 'progress') return new ProgressEvent(options.init)
      // @ts-ignore
      if (eventType === 'ratechange') return new Event(options.init)
      // @ts-ignore
      if (eventType === 'reset') return new Event(options.init)
      // @ts-ignore
      if (eventType === 'scroll') return new Event(options.init)
      // @ts-ignore
      if (eventType === 'securitypolicyviolation') return new SecurityPolicyViolationEvent(options.init)
      // @ts-ignore
      if (eventType === 'seeked') return new Event(options.init)
      // @ts-ignore
      if (eventType === 'seeking') return new Event(options.init)
      // @ts-ignore
      if (eventType === 'select') return new Event(options.init)
      // @ts-ignore
      if (eventType === 'selectionchange') return new Event(options.init)
      // @ts-ignore
      if (eventType === 'selectstart') return new Event(options.init)
      // @ts-ignore
      if (eventType === 'stalled') return new Event(options.init)
      // @ts-ignore
      if (eventType === 'submit') return new Event(options.init)
      // @ts-ignore
      if (eventType === 'suspend') return new Event(options.init)
      // @ts-ignore
      if (eventType === 'timeupdate') return new Event(options.init)
      // @ts-ignore
      if (eventType === 'toggle') return new Event(options.init)
      // @ts-ignore
      if (eventType === 'touchcancel') return new TouchEvent(options.init)
      // @ts-ignore
      if (eventType === 'touchend') return new TouchEvent(options.init)
      // @ts-ignore
      if (eventType === 'touchmove') return new TouchEvent(options.init)
      // @ts-ignore
      if (eventType === 'touchstart') return new TouchEvent(options.init)
      // @ts-ignore
      if (eventType === 'transitioncancel') return new TransitionEvent(options.init)
      // @ts-ignore
      if (eventType === 'transitionend') return new TransitionEvent(options.init)
      // @ts-ignore
      if (eventType === 'transitionrun') return new TransitionEvent(options.init)
      // @ts-ignore
      if (eventType === 'transitionstart') return new TransitionEvent(options.init)
      // @ts-ignore
      if (eventType === 'volumechange') return new Event(options.init)
      // @ts-ignore
      if (eventType === 'waiting') return new Event(options.init)
      // @ts-ignore
      if (eventType === 'wheel') return new WheelEvent(options.init)
      // @ts-ignore
      if (eventType === 'copy') return new ClipboardEvent(options.init)
      // @ts-ignore
      if (eventType === 'cut') return new ClipboardEvent(options.init)
      // @ts-ignore
      if (eventType === 'paste') return new ClipboardEvent(options.init)
      // @ts-ignore
      if (eventType === 'fullscreenchange') return new Event(options.init)
      // @ts-ignore
      if (eventType === 'fullscreenerror') return new Event(options.init)
      // @ts-ignore
      if (eventType === 'pointerlockchange') return new Event(options.init)
      // @ts-ignore
      if (eventType === 'pointerlockerror') return new Event(options.init)
      // @ts-ignore
      if (eventType === 'readystatechange') return new Event(options.init)
      // @ts-ignore
      if (eventType === 'visibilitychange') return new Event(options.init)
  }
}

type EventTypeMaps = Omit<HTMLElementEventMap, 'resize'> & Omit<DocumentEventMap, 'resize'>


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
const toComboItems = lazyCollectionMap<string, string>(name => name === '' ? delimiter : name)
const delimiter = '+'
export function toCombo (type: string): string[] {
  // If the delimiter is used as a character in the type,
  // two empty strings will be produced by the split.
  // createUnique ensures those two are combined into one.
  return lazyCollectionPipe(
    unique,
    toComboItems,
    lazyCollectionToArray(),
  )(type.split(delimiter)) as string[]
}

export function fromComboItemNameToType (name: string) {
  return lazyCollectionFind((type: ListenableComboItemType) => predicatesByType[type](name))(listenableComboItemTypes) as ListenableComboItemType ?? 'custom'
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

export function createExceptAndOnlyEffect<Type extends ListenableSupportedEventType> (effect: ListenEffect<Type>, options: ListenOptions<Type>): ListenEffect<Type> {
  const { except = [], only = [] } = options
  
  return ((event: ListenEffectParam<Type>) => {
    const { target } = event,
          [matchesOnly, matchesExcept] = target instanceof Element
            ? createMap<string[], boolean>(selectors => lazyCollectionSome<string>(selector => target.matches(selector))(selectors) as boolean)([only, except])
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
  }) as ListenEffect<Type>
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
