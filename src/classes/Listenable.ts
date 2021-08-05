import {
  some as lazyCollectionSome,
  every as lazyCollectionEvery,
} from 'lazy-collections'
import { Recognizeable } from './Recognizeable'
import type { RecognizeableOptions } from './Recognizeable'
import {
  isArray,
  isNumber,
  toKey,
  ensureKeycombo,
  ensureClickcombo,
  ensurePointercombo,
  fromComboItemNameToType,
  toModifier,
  isModified,
  createExceptAndOnlyHandle,
} from '../extracted'
import type {
  ListenableModifier,
  ListenableModifierAlias,
  ListenableKeycomboItem,
} from '../extracted'

export type ListenableSupportedType = 'recognizeable'
  | 'intersect'
  | 'mutate'
  | 'resize'
  | 'idle'
  | ListenableMediaQuery
  | ListenableClickcombo
  | ListenableLeftClick
  | ListenableRightClick
  | ListenablePointercombo
  | ListenableKeycombo
  // | ListenableKey
  | keyof Omit<HTMLElementEventMap, 'resize'>
  | keyof Omit<DocumentEventMap, 'resize'>

type ListenableMediaQuery = `(${string})`

type ListenableClickcombo = `${string}+${ListenableLeftClick | ListenableRightClick}`
type ListenableLeftClick = 'click' | 'mousedown' | 'mouseup' | 'dblclick'
type ListenableRightClick = 'rightclick' | 'contextmenu'

type ListenablePointercombo =  `${string}+${ListenablePointer}`
type ListenablePointer =  'pointerdown' | 'pointerup' | 'pointermove' | 'pointerover' | 'pointerout' | 'pointerenter' | 'pointerleave' | 'pointercancel' | 'gotpointercapture' | 'lostpointercapture'

// Would love to incorporate the more specific types, but it slows down type checking way too much
export type ListenableKeycombo = `${string}+${string}`
// type ListenableKey = ListenableSingleCharacter | ListenableArrow |  ListenableOther | ListenableModifier | ListenableModifierAlias
// type ListenableSingleCharacter = 'a'
//   | 'b'
//   | 'c'
//   | 'd'
//   | 'e'
//   | 'f'
//   | 'g'
//   | 'h'
//   | 'i'
//   | 'j'
//   | 'k'
//   | 'l'
//   | 'm'
//   | 'n'
//   | 'o'
//   | 'p'
//   | 'q'
//   | 'r'
//   | 's'
//   | 't'
//   | 'u'
//   | 'v'
//   | 'w'
//   | 'x'
//   | 'y'
//   | 'z'
//   | 'A'
//   | 'B'
//   | 'C'
//   | 'D'
//   | 'E'
//   | 'F'
//   | 'G'
//   | 'H'
//   | 'I'
//   | 'J'
//   | 'K'
//   | 'L'
//   | 'M'
//   | 'N'
//   | 'O'
//   | 'P'
//   | 'Q'
//   | 'R'
//   | 'S'
//   | 'T'
//   | 'U'
//   | 'V'
//   | 'W'
//   | 'X'
//   | 'Y'
//   | 'Z'
//   | '0'
//   | '1'
//   | '2'
//   | '3'
//   | '4'
//   | '5'
//   | '6'
//   | '7'
//   | '8'
//   | '9'
//   | ','
//   | '<'
//   | '.'
//   | '>'
//   | '/'
//   | '?'
//   | ';'
//   | ':'
//   | "'"
//   | '"'
//   | '['
//   | '{'
//   | ']'
//   | '}'
//   | '\\'
//   | '|'
//   | '`'
//   | '~'
//   | '!'
//   | '@'
//   | '#'
//   | '$'
//   | '%'
//   | '^'
//   | '&'
//   | '*'
//   | '('
//   | ')'
//   | '-'
//   | '_'
//   | '='
//   | '+'
// type ListenableArrow = 'arrow'
//   | 'vertical'
//   | 'horizontal'
//   | 'up'
//   | 'right'
//   | 'down'
//   | 'left'
// type ListenableOther = 'tab'
//   | 'space'
//   | 'enter'
//   | 'backspace'
//   | 'esc'
//   | 'home'
//   | 'end'
//   | 'pagedown'
//   | 'pageup'
//   | 'capslock'
//   | 'f1'
//   | 'f2'
//   | 'f3'
//   | 'f4'
//   | 'f5'
//   | 'f6'
//   | 'f7'
//   | 'f8'
//   | 'f9'
//   | 'f10'
//   | 'f11'
//   | 'f12'
//   | 'f13'
//   | 'f14'
//   | 'f15'
//   | 'f16'
//   | 'f17'
//   | 'f18'
//   | 'f19'
//   | 'f20'
//   | 'camera'
//   | 'delete'
export type ListenableSupportedEventType = ListenableClickcombo
  | ListenablePointercombo
  | ListenableKeycombo
  | keyof Omit<HTMLElementEventMap, 'resize'>
  | keyof Omit<DocumentEventMap, 'resize'>

export type ListenableOptions<Type extends ListenableSupportedType, RecognizeableMetadata> = {
  recognizeable?: RecognizeableOptions<Type, RecognizeableMetadata>
}

export type ListenHandle<Type extends ListenableSupportedType> = 
  Type extends 'intersect' ? (entries: ListenHandleParam<Type>) => any :
  Type extends 'mutate' ? (records: ListenHandleParam<Type>) => any :
  Type extends 'resize' ? (entries: ListenHandleParam<Type>) => any :
  Type extends 'idle' ? (deadline: ListenHandleParam<Type>) => any :
  Type extends ListenableMediaQuery ? (event: ListenHandleParam<Type>) => any :
  Type extends ListenableClickcombo ? (event: ListenHandleParam<Type>) => any :
  Type extends ListenablePointercombo ? (event: ListenHandleParam<Type>) => any :
  Type extends ListenableKeycombo ? (event: ListenHandleParam<Type>) => any :
  Type extends keyof Omit<HTMLElementEventMap, 'resize'> ? (event: ListenHandleParam<Type>) => any :
  Type extends keyof Omit<DocumentEventMap, 'resize'> ? (event: ListenHandleParam<Type>) => any :
  never

export type ListenHandleParam<Type extends ListenableSupportedType> = 
  Type extends 'intersect' ? IntersectionObserverEntry[] :
  Type extends 'mutate' ? MutationRecord[] :
  Type extends 'resize' ? ResizeObserverEntry[] :
  Type extends 'idle' ? IdleDeadline :
  Type extends ListenableMediaQuery ? MediaQueryListEvent :
  Type extends ListenableClickcombo ? MouseEvent :
  Type extends ListenableLeftClick ? MouseEvent :
  Type extends ListenableRightClick ? MouseEvent :
  Type extends ListenablePointercombo ? PointerEvent :
  Type extends ListenableKeycombo ? KeyboardEvent :
  Type extends keyof Omit<HTMLElementEventMap, 'resize'> ? HTMLElementEventMap[Type] :
  Type extends keyof Omit<DocumentEventMap, 'resize'> ? DocumentEventMap[Type] :
  never

export type ListenOptions<Type extends ListenableSupportedType> = 
  Type extends 'intersect' ? { observer?: IntersectionObserverInit } & ObservationListenOptions :
  Type extends 'mutate' ? { observe?: MutationObserverInit } & ObservationListenOptions :
  Type extends 'resize' ? { observe?: ResizeObserverOptions } & ObservationListenOptions :
  Type extends 'idle' ? { requestIdleCallback?: IdleRequestOptions } :
  Type extends ListenableMediaQuery ? {} :
  Type extends ListenableClickcombo ? EventListenOptions :
  Type extends ListenablePointercombo ? EventListenOptions :
  Type extends ListenableKeycombo ? { keyDirection?: 'up' | 'down' } & EventListenOptions :
  Type extends keyof Omit<HTMLElementEventMap, 'resize'> ? EventListenOptions :
  Type extends keyof Omit<DocumentEventMap, 'resize'> ? EventListenOptions :
  never

type ObservationListenOptions = { target?: Element }

type EventListenOptions = {
  target?: Element | Document | Window & typeof globalThis
  addEventListener?: AddEventListenerOptions,
  useCapture?: boolean,
  // Can support wantsUnstrusted if needed
  except?: string[],
  only?: string[],
}

export type ListenableActive<Type extends ListenableSupportedType, RecognizeableMetadata extends Record<any, any> = Record<any, any>> = 
  Type extends 'intersect' ? { target: Element, id: IntersectionObserver } :
  Type extends 'mutate' ? { target: Element, id: MutationObserver } :
  Type extends 'resize' ? { target: Element, id: ResizeObserver } :
  Type extends 'idle' ? { target: Window & typeof globalThis, id: number } :
  Type extends ListenableMediaQuery ? { target: MediaQueryList, id: [type: string, handle: ListenHandle<Type>] } :
  Type extends ListenableSupportedEventType ? { target: Element | Document, id: ListenableActiveEventId<Type> } :
  { id: Listenable<Type, RecognizeableMetadata> }

type ListenableActiveEventId<Type extends ListenableSupportedEventType> = [
  type: string,
  exceptAndOnlyHandle: ListenHandle<Type>,
  optionsOrUseCapture: AddEventListenerOptions | boolean,
]

export type ListenableStatus = 'ready' | 'listening' | 'stopped'

export class Listenable<Type extends ListenableSupportedType, RecognizeableMetadata extends Record<any, any> = Record<any, any>> {
  _computedRecognizeable: Recognizeable<Type, RecognizeableMetadata>
  _recognizeableHandlerKeys: Type[]
  _computedActive: Set<ListenableActive<Type>>
  constructor (type: Type, options?: ListenableOptions<Type, RecognizeableMetadata>) {
    if (type === 'recognizeable') {
      this._computedRecognizeable = new Recognizeable<Type, RecognizeableMetadata>([], options.recognizeable)
      this._recognizeableHandlerKeys = isArray(options?.recognizeable?.handlers)
        ? options.recognizeable.handlers.map(([key]) => key)
        : Object.keys(options?.recognizeable?.handlers || {})
    }    

    this._computedActive = new Set()

    this.setType(type)
    this.ready()
  }
  _computedStatus: ListenableStatus
  private ready () {
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

  listen (handle: ListenHandle<Type>, options: ListenOptions<Type> = {} as ListenOptions<Type>) {
    // These type assertions are confident because toImplementation is thoroughly tested.
    switch (this._implementation) {
      case 'intersection':
        this.intersectionListen(handle as unknown as ListenHandle<'intersect'>, options as ListenOptions<'intersect'>)
        break
      case 'mutation':
        this.mutationListen(handle as unknown as ListenHandle<'mutate'>, options as ListenOptions<'mutate'>)
        break
      case 'resize':
        this.resizeListen(handle as unknown as ListenHandle<'resize'>, options as ListenOptions<'resize'>)
        break
      case 'mediaquery':
        this.mediaQueryListen(handle as ListenHandle<'(_)'>)
        break
      case 'idle':
        this.idleListen(handle as unknown as ListenHandle<'idle'>, options as ListenOptions<'idle'>)
        break
      case 'recognizeable':
        this.recognizeableListen(handle as ListenHandle<Type>, options as ListenOptions<Type>)
        break
      case 'documentevent':
        this.documentEventListen(handle as ListenHandle<'visibilitychange'>, options as ListenOptions<'visibilitychange'>)
        break
      case 'keycombo':
        this.keycomboListen(handle as ListenHandle<'cmd+b'>, options as ListenOptions<'cmd+b'>)
        break
      case 'leftclickcombo':
      case 'rightclickcombo':
        this.clickcomboListen(handle as ListenHandle<'cmd+click'>, options as ListenOptions<'cmd+click'>)
        break
      case 'pointercombo':
        this.pointercomboListen(handle as ListenHandle<'cmd+click'>, options as ListenOptions<'cmd+click'>)
        break
      case 'event':
        this.eventListen(handle as ListenHandle<ListenableSupportedEventType>, options as ListenOptions<ListenableSupportedEventType>)
        break
    }

    this.listening()

    return this
  }
  private intersectionListen (handle: ListenHandle<'intersect'>, options: ListenOptions<'intersect'>) {
    const { target = document.querySelector('html'), observer } = options,
          id = new IntersectionObserver(handle, observer)

    id.observe(target)
    this.active.add({ target, id } as ListenableActive<Type>)
  }
  private mutationListen (handle: ListenHandle<'mutate'>, options: ListenOptions<'mutate'>) {
    const { target = document.querySelector('html'), observe } = options,
          id = new MutationObserver(handle)

    id.observe(target, observe)
    this.active.add({ target, id } as ListenableActive<Type>)
  }
  private resizeListen (handle: ListenHandle<'resize'>, options: ListenOptions<'resize'>) {
    const { target = document.querySelector('html'), observe } = options,
          id = new ResizeObserver(handle)

    id.observe(target, observe)
    this.active.add({ target, id } as ListenableActive<Type>)
  }
  private mediaQueryListen (handle: ListenHandle<'(_)'>) {
    const target = window.matchMedia(this.type)

    target.addEventListener('change', handle)
    this.active.add({ target, id: ['change', handle] } as ListenableActive<Type>)
  }
  private idleListen (handle: ListenHandle<'idle'>, options: ListenOptions<'idle'>) {
    const { requestIdleCallback } = options,
          id = window.requestIdleCallback(handle, requestIdleCallback)

    this.active.add({ target: window, id } as ListenableActive<Type>)
  }
  private recognizeableListen (handle: (sequenceItem: ListenHandleParam<Type>) => any, options: ListenOptions<Type>) {
    this.recognizeable.setEffect(handle)

    const guardedHandle = (sequenceItem: ListenHandleParam<Type>) => {
      this.recognizeable.recognize(sequenceItem)

      if (this.recognizeable.status === 'recognized') {
        handle(sequenceItem)
      }
    }

    for (const handlerKey of this._recognizeableHandlerKeys) {
      const listenable = new Listenable(handlerKey)
      listenable.listen(guardedHandle as ListenHandle<Type>, options)
      this.active.add({ id: listenable } as ListenableActive<Type>)
    }
  }
  private documentEventListen (handle: ListenHandle<'visibilitychange'>, options: ListenOptions<'visibilitychange'>) {
    // Override the target option with document
    const ensuredOptions = {
      ...options,
      target: document,
    }
    
    this.eventListen(handle, ensuredOptions)
  }
  private pointercomboListen (handle: ListenHandle<'cmd+pointerdown'>, options: ListenOptions<'cmd+pointerdown'>) {
    const pointercombo = ensurePointercombo(this.type),
          guardedHandle = (event: PointerEvent) => {
            if (eventMatchesPointercombo({ event, pointercombo })) {
              handle(event)
            }
          }
    
    this.eventListen(guardedHandle, options)
  }
  private clickcomboListen (handle: ListenHandle<'cmd+click'>, options: ListenOptions<'cmd+click'>) {
    const clickcombo = ensureClickcombo(this.type),
          guardedHandle = (event: MouseEvent) => {
            if (eventMatchesClickcombo({ event, clickcombo })) {
              handle(event)
            }
          }
    
    this.eventListen(guardedHandle, options)
  }
  private keycomboListen (handle: ListenHandle<'cmd+b'>, options: ListenOptions<'cmd+b'>) {
    const keycombo = ensureKeycombo(this.type),
          guardedHandle = (event: KeyboardEvent) => {            
            if (eventMatchesKeycombo({ event, keycombo })) {
              handle(event)
            }
          }
    
    this.eventListen(guardedHandle, options)
  }
  private eventListen<EventType extends ListenableSupportedEventType> (handle: ListenHandle<EventType>, options: ListenOptions<EventType>) {
    const type = (() => {
      switch (this._implementation) {
        case 'keycombo':
          return `key${(options as ListenOptions<'cmd+b'>).keyDirection || 'down'}`
        case 'leftclickcombo':
          return this.type.match(/(\w+)$/)[1]
        case 'rightclickcombo':
          return 'contextmenu'
        default:
          return this.type
      }
    })()

    const { exceptAndOnlyHandle, handleOptions } = toAddEventListenerParams(handle, options),
          eventListeners: ListenableActiveEventId<EventType>[] = [[type, exceptAndOnlyHandle, ...handleOptions]]

    this.addEventListeners(eventListeners, options)
  }
  private addEventListeners<EventType extends ListenableSupportedEventType> (eventListeners: ListenableActiveEventId<EventType>[], options: ListenOptions<EventType>) {
    const { target = document } = options

    eventListeners.forEach(eventListener => {
      target.addEventListener(eventListener[0], eventListener[1], eventListener[2])
      this.active.add({ target, id: eventListener })
    })
  }
  private listening () {
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
        const stoppables: ListenableActive<Type>[] = [...this.active].filter(active => !target || ('target' in active ? active.target === target : false)), // Normally would use .isSameNode() here, but it needs to support MediaQueryLists too
              shouldUpdateStatus = stoppables.length === this.active.size
        
        for (const stoppable of stoppables) {
          stop(stoppable)
          this.active.delete(stoppable)
        }
        
        if (shouldUpdateStatus) {
          this.stopped()
        }

        break
      }

    return this
  }
  private stopped () {
    this._computedStatus = 'stopped'
  }
}

function stop<Type extends ListenableSupportedType> (stoppable: ListenableActive<Type>) {
  if (stoppable.id instanceof Listenable) {
    stoppable.id.stop()
    return
  }

  if (lazyCollectionSome<string>(type => observerAssertionsByType[type](stoppable.id))(['intersect', 'mutate', 'resize'])) {
    const { id } = stoppable as ListenableActive<'intersect' | 'mutate' | 'resize'>
    id.disconnect()
    return
  }

  if (isArray(stoppable.id)) {
    const { target, id } = stoppable as ListenableActive<'(_)'>
    target.removeEventListener(id[0], id[1])
    return
  }
  
  if (isNumber(stoppable.id)) {
    const { target, id } = stoppable as ListenableActive<'idle'>
    target.cancelIdleCallback(id)
    return
  }
  
  const { target, id } = stoppable as ListenableActive<ListenableSupportedEventType>
  target.removeEventListener(id[0], id[1], id[2])
}

export function toImplementation (type: string) {
  return [...predicatesByImplementation.keys()].find(implementation => predicatesByImplementation.get(implementation)(type))
}

type ListenableImplementation = 'recognizeable' | 'intersection' | 'mutation' | 'resize' | 'mediaquery' | 'idle' | 'documentevent' | 'keycombo' | 'leftclickcombo' | 'rightclickcombo' | 'pointercombo' | 'event'

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
    'documentevent',
    type => documentEvents.has(type)
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
    'pointercombo',
    type => implementationREs.pointercombo.test(type)
  ],
  [
    'event',
    () => true
  ]
])

const documentEvents = new Set([
  'fullscreenchange',
  'fullscreenerror',
  'pointerlockchange',
  'pointerlockerror',
  'readystatechange',
  'visibilitychange',
])

const implementationREs: { [implementation: string]: RegExp } = {
  mediaquery: /^\(.+\)$/,
  keycombo: /^((!?([a-zA-Z0-9,<.>/?;:'"[{\]}\\|`~!@#$%^&*()-_=+]|tab|space|arrow|vertical|horizontal|up|right|down|left|enter|backspace|esc|home|end|pagedown|pageup|capslock|f[0-9]{1,2}|camera|delete|cmd|command|meta|shift|ctrl|control|alt|opt|option))\+)*(!?([a-zA-Z0-9,<.>/?;:'"[{\]}\\|`~!@#$%^&*()-_=+]|tab|space|arrow|vertical|horizontal|up|right|down|left|enter|backspace|esc|home|end|pagedown|pageup|capslock|f[0-9]{1,2}|camera|delete|cmd|command|meta|shift|ctrl|control|alt|opt|option))$/,
  leftclickcombo: /^(!?((cmd|command|meta|shift|ctrl|control|alt|opt|option))\+){0,4}!?(click|mousedown|mouseup|dblclick)$/,
  rightclickcombo: /^(!?((cmd|command|meta|shift|ctrl|control|alt|opt|option))\+){0,4}!?(rightclick|contextmenu)$/,
  pointercombo: /^(!?((cmd|command|meta|shift|ctrl|control|alt|opt|option))\+){0,4}!?(pointerdown|pointerup|pointermove|pointerover|pointerout|pointerenter|pointerleave|pointercancel|gotpointercapture|lostpointercapture)$/,
}

export function toAddEventListenerParams<Type extends ListenableSupportedEventType> (handle: ListenHandle<Type>, options: ListenOptions<Type>) {
  const { addEventListener, useCapture } = options,
        exceptAndOnlyHandle = createExceptAndOnlyHandle(handle, options),
        handleOptions: [optionsOrUseCapture: AddEventListenerOptions | boolean] = [addEventListener || useCapture]

  return { exceptAndOnlyHandle, handleOptions }
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
    ({ event }) => arrows.has(event.key.toLowerCase())
  ],
  [
    '!arrow',
    ({ event }) => !arrows.has(event.key.toLowerCase()),
  ],
  [
    'vertical',
    ({ event }) => verticalArrows.has(event.key.toLowerCase()),
  ],
  [
    '!vertical',
    ({ event }) => !verticalArrows.has(event.key.toLowerCase()),
  ],
  [
    'horizontal',
    ({ event }) => horizontalArrows.has(event.key.toLowerCase()),
  ],
  [
    '!horizontal',
    ({ event }) => !horizontalArrows.has(event.key.toLowerCase()),
  ],
  [
    'default',
    ({ event, name }) => name.startsWith('!')
      ? event.key.toLowerCase() !== `arrow${name.toLowerCase()}`
      : event.key.toLowerCase() === `arrow${name.toLowerCase()}`,
  ]
])

const arrows = new Set(['arrowup', 'arrowright', 'arrowdown', 'arrowleft'])
const verticalArrows = new Set(['arrowup', 'arrowdown'])
const horizontalArrows = new Set(['arrowright', 'arrowleft'])


export function eventMatchesClickcombo ({ event, clickcombo }: { event: MouseEvent, clickcombo: string[] }): boolean {
  return lazyCollectionEvery<string>(name => (
    fromComboItemNameToType(name) === 'click'
    ||
    (name.startsWith('!') && !isModified({ alias: name.slice(1), event }))
    ||
    (!name.startsWith('!') && isModified({ alias: name, event }))
  ))(clickcombo) as boolean
}

export function eventMatchesPointercombo ({ event, pointercombo }: { event: PointerEvent, pointercombo: string[] }): boolean {
  return lazyCollectionEvery<string>(name => (
    fromComboItemNameToType(name) === 'pointer'
    ||
    (name.startsWith('!') && !isModified({ alias: name.slice(1), event }))
    ||
    (!name.startsWith('!') && isModified({ alias: name, event }))
  ))(pointercombo) as boolean
}

const observerAssertionsByType: Record<string, (observer: unknown) => boolean> = {
  intersect: observer => observer instanceof IntersectionObserver,
  mutate: observer => observer instanceof MutationObserver,
  resize: observer => observer instanceof ResizeObserver,
}
