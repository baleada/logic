import {
  some as lazyCollectionSome,
  every as lazyCollectionEvery,
} from 'lazy-collections'
import { Recognizeable } from './Recognizeable'
import type { RecognizeableSequenceItem, RecognizeableOptions } from './Recognizeable'
import {
  isArray,
  isNumber,
  toKey,
  toCombo,
  comboItemNameToType,
  toModifier,
} from '../util'
import type {
  ListenableModifier,
  ListenableModifierAlias,
  ListenableComboItemType,
} from '../util'

export type ListenableSupportedType = 
  IntersectionObserverEntry
  | MutationRecord
  | ResizeObserverEntry
  | MediaQueryListEvent
  | IdleDeadline
  | ListenableSupportedEvent

export type ListenableSupportedEvent = 
  KeyboardEvent
  | MouseEvent
  | TouchEvent
  | PointerEvent
  | ClipboardEvent
  | CustomEvent
  | Event

export type ListenableOptions<EventType extends ListenableSupportedType, RecognizeableMetadata> = {
  recognizeable?: RecognizeableOptions<RecognizeableSequenceItem<EventType>, RecognizeableMetadata>
}

export type ListenHandle<EventType extends ListenableSupportedType> = 
  EventType extends IntersectionObserverEntry ? (entries: IntersectionObserverEntry[]) => any :
  EventType extends MutationRecord ? (entries: MutationRecord[]) => any :
  EventType extends ResizeObserverEntry ? (entries: ResizeObserverEntry[]) => any :
  EventType extends IdleDeadline ? IdleRequestCallback :
  EventType extends MediaQueryListEvent | ListenableSupportedEvent ? (event: EventType) => any :
  () => void

export type ListenHandleParam<EventType extends ListenableSupportedType> = 
  EventType extends IntersectionObserverEntry ? IntersectionObserverEntry[] :
  EventType extends MutationRecord ? MutationRecord[] :
  EventType extends ResizeObserverEntry ? ResizeObserverEntry[] :
  EventType

export type ListenOptions<EventType extends ListenableSupportedType> = 
  EventType extends IntersectionObserverEntry ? { observer?: IntersectionObserverInit } & ObservationListenOptions :
  EventType extends MutationRecord ? { observe?: MutationObserverInit } & ObservationListenOptions :
  EventType extends ResizeObserverEntry ? { observe?: ResizeObserverOptions } & ObservationListenOptions :
  EventType extends MediaQueryListEvent ? {} :
  EventType extends KeyboardEvent ? { keyDirection?: 'up' | 'down' } & EventListenOptions :
  EventType extends MouseEvent | PointerEvent | ClipboardEvent | CustomEvent | Event | TouchEvent ? EventListenOptions :
  EventType extends IdleDeadline ? { requestIdleCallback?: IdleRequestOptions } :
  {}

type ObservationListenOptions = { target?: Element }

type EventListenOptions = {
  target?: Element | Document | Window & typeof globalThis
  addEventListener?: AddEventListenerOptions,
  useCapture?: boolean,
  // Can support wantsUnstrusted if needed
  except?: string[],
  only?: string[],
}

export type ListenableActive<EventType extends ListenableSupportedType, RecognizeableMetadata extends Record<any, any> = Record<any, any>> = 
  EventType extends IntersectionObserverEntry ? { target: Element, id: IntersectionObserver } :
  EventType extends MutationRecord ? { target: Element, id: MutationObserver } :
  EventType extends ResizeObserverEntry ? { target: Element, id: ResizeObserver } :
  EventType extends MediaQueryListEvent ? { target: MediaQueryList, id: [type: string, handle: ListenHandle<EventType>] } :
  EventType extends IdleDeadline ? { target: Window & typeof globalThis, id: number } :
  EventType extends ListenableSupportedEvent ? { target: Element | Document, id: ListenableActiveEventId<EventType> } :
  { id: Listenable<EventType, RecognizeableMetadata> }

type ListenableActiveEventId<EventType extends ListenableSupportedEvent> = [
  type: string,
  exceptAndOnlyHandle: ListenHandle<EventType>,
  optionsOrUseCapture: AddEventListenerOptions | boolean,
]

export type ListenableStatus = 'ready' | 'listening' | 'stopped'

export class Listenable<EventType extends ListenableSupportedType, RecognizeableMetadata extends Record<any, any> = Record<any, any>> {
  _computedRecognizeable: Recognizeable<RecognizeableSequenceItem<EventType>>
  _recognizeableHandlerKeys: string[]
  _computedActive: Set<ListenableActive<EventType>>
  constructor (type: string, options?: ListenableOptions<EventType, RecognizeableMetadata>) {
    if (type === 'recognizeable') {
      this._computedRecognizeable = new Recognizeable<RecognizeableSequenceItem<EventType>>([], options.recognizeable)
      this._recognizeableHandlerKeys = Object.keys(options?.recognizeable?.handlers || {})
    }    

    this._computedActive = new Set()

    this.setType(type)
    this._ready()
  }
  _computedStatus: ListenableStatus
  _ready () {
    this._computedStatus = 'ready'
  }

  get type () {
    return this._computedType
  }
  set type (type) {
    this.setType(type)
  }
  get status () {
    return this._computedStatus
  }
  get active () {
    return this._computedActive
  }
  get recognizeable () {
    return this._computedRecognizeable
  }

  _computedType: string
  _implementation: ListenableImplementation
  setType (type: string) {
    this.stop()
    this._computedType = type
    this._implementation = toImplementation(type)
    return this
  }

  listen (handle: ListenHandle<EventType>, options: ListenOptions<EventType> = {} as ListenOptions<EventType>) {
    switch (this._implementation) {
      case 'intersection':
        this._intersectionListen(handle as ListenHandle<IntersectionObserverEntry>, options as ListenOptions<IntersectionObserverEntry>)
        break
      case 'mutation':
        this._mutationListen(handle as ListenHandle<MutationRecord>, options as ListenOptions<MutationRecord>)
        break
      case 'resize':
        this._resizeListen(handle as ListenHandle<ResizeObserverEntry>, options as ListenOptions<ResizeObserverEntry>)
        break
      case 'mediaquery':
        this._mediaQueryListen(handle as (event: MediaQueryListEvent) => any)
        break
      case 'idle':
        this._idleListen(handle as ListenHandle<IdleDeadline>, options as ListenOptions<IdleDeadline>)
        break
      case 'recognizeable':
        this._recognizeableListen(handle as (event: RecognizeableSequenceItem<EventType>) => void, options as ListenOptions<EventType>)
        break
      case 'visibilitychange':
        this._visibilityChangeListen(handle as ListenHandle<Event>, options as ListenOptions<Event>)
        break
      case 'keycombo':
        this._keycomboListen(handle as ListenHandle<KeyboardEvent>, options as ListenOptions<KeyboardEvent>)
        break
      case 'leftclickcombo':
      case 'rightclickcombo':
        this._clickcomboListen(handle as ListenHandle<MouseEvent>, options as ListenOptions<MouseEvent>)
        break
      case 'event':
        this._eventListen(handle as ListenHandle<ListenableSupportedEvent>, options as ListenOptions<ListenableSupportedEvent>)
        break
    }

    this._listening()

    return this
  }
  _intersectionListen (handle: ListenHandle<IntersectionObserverEntry>, options: ListenOptions<IntersectionObserverEntry>) {
    const { target = document.querySelector('html'), observer } = options,
          id = new IntersectionObserver(handle, observer)

    id.observe(target)
    this.active.add({ target, id } as ListenableActive<EventType>)
  }
  _mutationListen (handle: ListenHandle<MutationRecord>, options: ListenOptions<MutationRecord>) {
    const { target = document.querySelector('html'), observe } = options,
          id = new MutationObserver(handle)

    id.observe(target, observe)
    this.active.add({ target, id } as ListenableActive<EventType>)
  }
  _resizeListen (handle: ListenHandle<ResizeObserverEntry>, options: ListenOptions<ResizeObserverEntry>) {
    const { target = document.querySelector('html'), observe } = options,
          id = new ResizeObserver(handle)

    id.observe(target, observe)
    this.active.add({ target, id } as ListenableActive<EventType>)
  }
  _mediaQueryListen (handle: ListenHandle<MediaQueryListEvent>) {
    const target = window.matchMedia(this.type)

    target.addEventListener('change', handle)
    this.active.add({ target, id: ['change', handle] } as ListenableActive<EventType>)
  }
  _idleListen (handle: ListenHandle<IdleDeadline>, options: ListenOptions<IdleDeadline>) {
    const { requestIdleCallback } = options,
          id = window.requestIdleCallback(handle, requestIdleCallback)

    this.active.add({ target: window, id } as ListenableActive<EventType>)
  }
  _recognizeableListen (handle: (event: RecognizeableSequenceItem<EventType>) => void, options: ListenOptions<EventType>) {
    this.recognizeable.setEffect(handle)

    const guardedHandle = (event: RecognizeableSequenceItem<EventType>) => {
      this.recognizeable.recognize(event)

      if (this.recognizeable.status === 'recognized') {
        handle(event)
      }
    }

    for (const handlerKey of this._recognizeableHandlerKeys) {
      const listenable = new Listenable(handlerKey)
      listenable.listen(guardedHandle as ListenHandle<EventType>, options)
      this.active.add({ id: listenable } as ListenableActive<EventType>)
    }
  }
  _visibilityChangeListen (handle: ListenHandle<Event>, options: ListenOptions<Event>) {
    const ensuredOptions = {
      ...options,
      target: document,
    }
    
    this._eventListen(handle as ListenHandle<ListenableSupportedEvent>, ensuredOptions as ListenOptions<ListenableSupportedEvent>)
  }
  _keycomboListen (handle: ListenHandle<KeyboardEvent>, options: ListenOptions<KeyboardEvent>) {
    const keycombo = ensureKeycombo(this.type),
          guardedHandle = (event: KeyboardEvent) => {            
            if (eventMatchesKeycombo({ event, keycombo })) {
              handle(event)
            }
          }
    
    this._eventListen(guardedHandle as ListenHandle<ListenableSupportedEvent>, options as ListenOptions<ListenableSupportedEvent>)
  }
  _clickcomboListen (handle: ListenHandle<MouseEvent>, options: ListenOptions<MouseEvent>) {
    const clickcombo = ensureClickcombo(this.type),
          guardedHandle = (event: MouseEvent) => {
            if (eventMatchesClickcombo({ event, clickcombo })) {
              handle(event)
            }
          }
    
    this._eventListen(guardedHandle as ListenHandle<ListenableSupportedEvent>, options as ListenOptions<ListenableSupportedEvent>)
  }
  _eventListen (handle: ListenHandle<ListenableSupportedEvent>, options: ListenOptions<ListenableSupportedEvent>) {
    const type = (() => {
      switch (this._implementation) {
        case 'keycombo':
          return `key${(options as ListenOptions<KeyboardEvent>).keyDirection || 'down'}`
        case 'leftclickcombo': // click | mousedown | mouseup | dblclick
          return this.type.match(/(\w+)$/)[1]
        case 'rightclickcombo':
          return 'contextmenu'
        default:
          return this.type
      }
    })()

    const { exceptAndOnlyHandle, handleOptions } = toAddEventListenerParams<ListenableSupportedEvent>(handle, options),
          eventListeners: ListenableActiveEventId<ListenableSupportedEvent>[] = [[type, exceptAndOnlyHandle, ...handleOptions]]

    this._addEventListeners(eventListeners, options)
  }
  _addEventListeners (eventListeners: ListenableActiveEventId<ListenableSupportedEvent>[], options: ListenOptions<ListenableSupportedEvent>) {
    const { target = document } = options

    eventListeners.forEach(eventListener => {
      target.addEventListener(...eventListener)
      this.active.add({ target, id: eventListener } as ListenableActive<EventType>)
    })
  }
  _listening () {
    this._computedStatus = 'listening'
  }

  stop (options: { target?: Element } = {}) {
    const { target } = options

    switch (this.status) {
      case 'ready':
      case undefined:
        // Do nothing. This call is coming from the initial setType
        // and shouldn't use web APIs during construction.
        break
      default:
        const stoppables = [...this.active].filter(active => !target || active.target === target), // Normally would use .isSameNode() here, but it needs to support MediaQueryLists too
              shouldUpdateStatus = stoppables.length === this.active.size

        stoppables.forEach(stoppable => {
          stop<EventType>(stoppable)
          this.active.delete(stoppable)
        })
        
        if (shouldUpdateStatus) {
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

function stop<EventType extends ListenableSupportedType> (stoppable: ListenableActive<EventType>) {
  if (stoppable.id instanceof Listenable) {
    stoppable.id.stop()
  }

  if (lazyCollectionSome<string>(type => observerAssertionsByType.get(type)(stoppable.id))(['intersect', 'mutate', 'resize'])) {
    const { id } = stoppable as ListenableActive<IntersectionObserverEntry | ResizeObserverEntry | MutationRecord>
    id.disconnect()
    return
  }

  if (isArray(stoppable.id)) {
    const { target, id } = stoppable as ListenableActive<MediaQueryListEvent>
    target.removeEventListener(id[0], id[1])
    return
  }
  
  if (isNumber(stoppable.id)) {
    const { target, id } = stoppable as ListenableActive<IdleDeadline>
    target.cancelIdleCallback(id)
    return
  }
  
  const { target, id } = stoppable as ListenableActive<KeyboardEvent | MouseEvent | CustomEvent | Event>
  target.removeEventListener(id[0], id[1], id[2])
}

export function toImplementation (type: string) {
  return [...predicatesByImplementation.keys()].find(implementation => predicatesByImplementation.get(implementation)(type))
}

type ListenableImplementation = 'recognizeable' | 'intersection' | 'mutation' | 'resize' | 'mediaquery' | 'idle' | 'visibilitychange' | 'keycombo' | 'leftclickcombo' | 'rightclickcombo' | 'event'

const predicatesByImplementation = new Map<ListenableImplementation, ((type: string) => boolean)>([
  [
    'recognizeable',
    type => type === 'recognizeable'
  ],
  [
    'intersection',
    type => type === 'intersect'
  ],
  [
    'mutation',
    type => type === 'mutate'
  ],
  [
    'resize',
    type => type === 'resize'
  ],
  [
    'mediaquery',
    type => implementationREs.mediaquery.test(type)
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
    type => implementationREs.keycombo.test(type)
  ],
  [
    'leftclickcombo',
    type => implementationREs.leftclickcombo.test(type)
  ],
  [
    'rightclickcombo',
    type => implementationREs.rightclickcombo.test(type)
  ],
  [
    'event',
    () => true
  ]
])

const implementationREs: { [implementation: string]: RegExp } = {
  mediaquery: /^\(.+\)$/,
  keycombo: /^((!?([a-zA-Z0-9,<.>/?;:'"[{\]}\\|`~!@#$%^&*()-_=+]|tab|space|arrow|vertical|horizontal|up|right|down|left|enter|backspace|esc|home|end|pagedown|pageup|capslock|f[0-9]{1,2}|camera|delete|cmd|command|meta|shift|ctrl|control|alt|opt))\+)*(!?([a-zA-Z0-9,<.>/?;:'"[{\]}\\|`~!@#$%^&*()-_=+]|tab|space|arrow|vertical|horizontal|up|right|down|left|enter|backspace|esc|home|end|pagedown|pageup|capslock|f[0-9]{1,2}|camera|delete|cmd|command|meta|shift|ctrl|control|alt|opt))$/,
  leftclickcombo: /^(!?((cmd|command|meta|shift|ctrl|control|alt|opt))\+){0,4}(click|mousedown|mouseup|dblclick)$/,
  rightclickcombo: /^(!?((cmd|command|meta|shift|ctrl|control|alt|opt))\+){0,4}(rightclick|contextmenu)$/,
}

export function toAddEventListenerParams<EventType extends ListenableSupportedEvent> (handle: (event: EventType) => any, options: ListenOptions<EventType>) {
  const { addEventListener, useCapture } = options,
        exceptAndOnlyHandle = createExceptAndOnlyHandle<EventType>(handle, options),
        handleOptions: [optionsOrUseCapture: AddEventListenerOptions | boolean] = [addEventListener || useCapture]

  return { exceptAndOnlyHandle, handleOptions }
}

export function createExceptAndOnlyHandle<EventType extends ListenableSupportedEvent> (handle: (event: EventType) => any, options: ListenOptions<EventType>): (event: EventType) => any {
  const { except = [], only = [] } = options
  
  return (event: EventType) => {
    const { target } = event,
          [matchesOnly, matchesExcept] = target instanceof Element
            ? [only, except].map(selectors => lazyCollectionSome<string>(selector => target.matches(selector))(selectors))
            : [false, true]

    if (matchesOnly) {
      handle(event)
      return
    }
    
    if (only.length === 0 && !matchesExcept) {
      handle(event)
      return
    }
  }
}

export type ListenableKeycomboItem = {
  name: string,
  type: ListenableComboItemType | 'custom'
}

export function ensureKeycombo (type: string): ListenableKeycomboItem[] {
  return toCombo(type).map(name => ({ name, type: comboItemNameToType(name) }))
}

export function ensureClickcombo (type: string): string[] {
  return toCombo(type)
}

export function eventMatchesKeycombo ({ event, keycombo }: { event: KeyboardEvent, keycombo: ListenableKeycomboItem[] }): boolean {
  return lazyCollectionEvery<ListenableKeycomboItem>(({ name, type }, index) => {
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
        return predicatesByArrow.get(name as ListenableArrowAlias)?.({ event, name }) ?? predicatesByArrow.get('default')({ event, name })
      case 'modifier':
        if (index === keycombo.length - 1) {
          return name.startsWith('!')
            ? event.key.toLowerCase() !== toModifier(name.slice(1) as ListenableModifier | ListenableModifierAlias).toLowerCase()
            : event.key.toLowerCase() === toModifier(name as ListenableModifier | ListenableModifierAlias).toLowerCase()
        }

        return name.startsWith('!')
          ? !isModified({ event, alias: name.slice(1) })
          : isModified({ event, alias: name })
    }
  })(keycombo) as boolean
}

type ListenableArrowAlias = 'arrow' | '!arrow' | 'vertical' | '!vertical' | 'horizontal' | '!horizontal' | 'default'
const predicatesByArrow: Map<ListenableArrowAlias, (required: { event: KeyboardEvent, name?: string }) => boolean> = new Map([
  [
    'arrow',
    ({ event }) => ARROWS.has(event.key.toLowerCase())
  ],
  [
    '!arrow',
    ({ event }) => !ARROWS.has(event.key.toLowerCase()),
  ],
  [
    'vertical',
    ({ event }) => VERTICAL_ARROWS.has(event.key.toLowerCase()),
  ],
  [
    '!vertical',
    ({ event }) => !VERTICAL_ARROWS.has(event.key.toLowerCase()),
  ],
  [
    'horizontal',
    ({ event }) => HORIZONTAL_ARROWS.has(event.key.toLowerCase()),
  ],
  [
    '!horizontal',
    ({ event }) => !HORIZONTAL_ARROWS.has(event.key.toLowerCase()),
  ],
  [
    'default',
    ({ event, name }) => name.startsWith('!')
      ? event.key.toLowerCase() !== `arrow${name.toLowerCase()}`
      : event.key.toLowerCase() === `arrow${name.toLowerCase()}`,
  ]
])

const ARROWS = new Set(['arrowup', 'arrowright', 'arrowdown', 'arrowleft'])
const VERTICAL_ARROWS = new Set(['arrowup', 'arrowdown'])
const HORIZONTAL_ARROWS = new Set(['arrowright', 'arrowleft'])

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


// export type ListenableClickcomboItem = ListenableModifier | ListenableModifierAlias | 'click'
export type ListenableClickcomboItem = string
export function eventMatchesClickcombo ({ event, clickcombo }: { event: MouseEvent, clickcombo: string[] }): boolean {
  return clickcombo.every(name => (
    comboItemNameToType(name) === 'click'
    ||
    (name.startsWith('!') && !isModified({ alias: name.slice(1), event }))
    ||
    (!name.startsWith('!') && isModified({ alias: name, event }))
  ))
}

const observerAssertionsByType: Map<string, (observer: unknown) => boolean> = new Map([
  ['intersect', observer => observer instanceof IntersectionObserver],
  ['mutate', observer => observer instanceof MutationObserver],
  ['resize', observer => observer instanceof ResizeObserver],
])
