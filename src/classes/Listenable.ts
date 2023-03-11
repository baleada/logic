import {
  some,
  every,
  find,
} from 'lazy-collections'
import { Recognizeable } from './Recognizeable'
import type { RecognizeableOptions } from './Recognizeable'
import {
  predicateNumber,
  toKey,
  fromComboItemNameToType,
  toModifier,
  predicateModified,
  predicateFunction,
} from '../extracted'
import { createExceptAndOnlyEffect } from "../extracted"
import type {
  ListenableModifier,
  ListenableModifierAlias,
  ListenableKeycomboItem,
} from '../extracted'
import { createClip } from '../pipes'

export type ListenableSupportedType = 'recognizeable'
  | 'intersect'
  | 'mutate'
  | 'resize'
  | 'idle'
  | 'message'
  | 'messageerror'
  | ListenableMediaQuery
  | keyof Omit<HTMLElementEventMap, 'resize'>
  | keyof Omit<DocumentEventMap, 'resize'>

type ListenableMediaQuery = `(${string})`

export type ListenableMousecombo = `${string}+${ListenableLeftClick | ListenableRightClick}`
type ListenableLeftClick = 'click' | 'dblclick' | `mouse${string}`
type ListenableRightClick = 'rightclick' | 'contextmenu'

export type ListenablePointercombo =  `${string}+${ListenablePointer}`
type ListenablePointer =  `pointer${string}`

// Would love to incorporate the more specific types, but it slows down type checking way too much
export type ListenableKeycombo = string // `${string}+${string}`
export type ListenableSupportedEventType = keyof Omit<HTMLElementEventMap, 'resize'> | keyof Omit<DocumentEventMap, 'resize'>

export type ListenableOptions<
  Type extends ListenableSupportedType,
  RecognizeableMetadata extends Record<any, any> = Record<any, any>
> = { recognizeable?: RecognizeableOptions<Type, RecognizeableMetadata> }

export type ListenEffect<Type extends ListenableSupportedType> = 
  Type extends 'intersect' ? (entries: ListenEffectParam<Type>) => any :
  Type extends 'mutate' ? (records: ListenEffectParam<Type>) => any :
  Type extends 'resize' ? (entries: ListenEffectParam<Type>) => any :
  Type extends 'idle' ? (deadline: ListenEffectParam<Type>) => any :
  Type extends ('message' | 'messageerror') ? (event: MessageEvent) => any : 
  Type extends ListenableMediaQuery ? (event: ListenEffectParam<Type>) => any :
  Type extends (ListenableLeftClick | ListenableRightClick) ? (event: ListenEffectParam<Type>) => any :
  Type extends (ListenablePointer) ? (event: ListenEffectParam<Type>) => any :
  Type extends ('keydown' | 'keyup') ? (event: ListenEffectParam<Type>) => any :
  Type extends keyof Omit<HTMLElementEventMap, 'resize'> ? (event: ListenEffectParam<Type>) => any :
  Type extends keyof Omit<DocumentEventMap, 'resize'> ? (event: ListenEffectParam<Type>) => any :
  never

export type ListenEffectParam<Type extends ListenableSupportedType> = 
  Type extends 'intersect' ? IntersectionObserverEntry[] :
  Type extends 'mutate' ? MutationRecord[] :
  Type extends 'resize' ? ResizeObserverEntry[] :
  Type extends 'idle' ? IdleDeadline :
  Type extends ListenableMediaQuery ? MediaQueryListEvent :
  Type extends ListenableRightClick ? MouseEvent :
  Type extends keyof Omit<HTMLElementEventMap, 'resize'> ? HTMLElementEventMap[Type] :
  Type extends keyof Omit<DocumentEventMap, 'resize'> ? DocumentEventMap[Type] :
  never

export type ListenOptions<Type extends ListenableSupportedType> = 
  Type extends 'intersect' ? { observer?: IntersectionObserverInit } & ObservationListenOptions :
  Type extends 'mutate' ? { observe?: MutationObserverInit } & ObservationListenOptions :
  Type extends 'resize' ? { observe?: ResizeObserverOptions } & ObservationListenOptions :
  Type extends 'idle' ? { requestIdleCallback?: IdleRequestOptions } :
  Type extends ('message' | 'messageerror') ? { target?: BroadcastChannel } :
  Type extends ListenableMediaQuery ? { instantEffect?: (list: MediaQueryList) => any } :
  Type extends keyof Omit<HTMLElementEventMap, 'resize'> ? EventListenOptions :
  Type extends keyof Omit<DocumentEventMap, 'resize'> ? EventListenOptions :
  never

type ObservationListenOptions = { target?: Element }

type EventListenOptions = {
  target?: Element | Document | (Window & typeof globalThis)
  addEventListener?: AddEventListenerOptions,
  useCapture?: boolean,
  // Can support wantsUnstrusted if needed
  except?: string[],
  only?: string[],
}

export type ListenableActive<
  Type extends ListenableSupportedType,
  RecognizeableMetadata extends Record<any, any> = Record<any, any>
> = 
  Type extends 'intersect' ? { target: Element, id: IntersectionObserver } :
  Type extends 'mutate' ? { target: Element, id: MutationObserver } :
  Type extends 'resize' ? { target: Element, id: ResizeObserver } :
  Type extends 'idle' ? { target: Window & typeof globalThis, id: number } :
  Type extends ('message' | 'messageerror') ? { target: BroadcastChannel, id: [type: string, effect: (event: MessageEvent) => void] } :
  Type extends ListenableMediaQuery ? { target: MediaQueryList, id: [type: string, effect: (param: ListenEffectParam<Type>) => void] } :
  Type extends ListenableSupportedEventType ? { target: Element | Document, id: ListenableActiveEventId<Type> } :
  { id: Listenable<Type, RecognizeableMetadata> }

type ListenableActiveEventId<Type extends ListenableSupportedEventType> = [
  type: Type,
  exceptAndOnlyEffect: (param: ListenEffectParam<Type>) => void,
  optionsOrUseCapture: AddEventListenerOptions | boolean,
]

export type ListenableStatus = 'ready' | 'listening' | 'stopped'

export class Listenable<Type extends ListenableSupportedType, RecognizeableMetadata extends Record<any, any> = Record<any, any>> {
  private computedRecognizeable: Recognizeable<Type, RecognizeableMetadata>
  private recognizeableEffectsKeys: Type[]
  private computedActive: Set<ListenableActive<Type, RecognizeableMetadata>>
  constructor (type: Type, options?: ListenableOptions<Type, RecognizeableMetadata>) {
    if (type === 'recognizeable') {
      this.computedRecognizeable = new Recognizeable<Type, RecognizeableMetadata>([], options?.recognizeable || {})
      this.recognizeableEffectsKeys = Object.keys(options?.recognizeable?.effects || {}) as Type[]
    }    

    this.computedActive = new Set()

    this.setType(type)
    this.ready()
  }
  private computedStatus: ListenableStatus
  private ready () {
    this.computedStatus = 'ready'
  }

  get type () {
    return this.computedType
  }
  set type (type) {
    this.setType(type)
  }
  get status () {
    return this.computedStatus
  }
  get active () {
    return this.computedActive
  }
  get recognizeable () {
    return this.computedRecognizeable
  }

  private computedType: string
  private implementation: ListenableImplementation
  setType (type: string) {
    this.stop()
    this.computedType = type
    this.implementation = toImplementation(type)
    return this
  }

  listen (effect: ListenEffect<Type>, options: ListenOptions<Type> = {} as ListenOptions<Type>) {
    // These type assertions are confident because toImplementation is thoroughly tested.
    switch (this.implementation) {
      case 'intersection':
        this.intersectionListen(effect as unknown as ListenEffect<'intersect'>, options as ListenOptions<'intersect'>)
        break
      case 'mutation':
        this.mutationListen(effect as unknown as ListenEffect<'mutate'>, options as ListenOptions<'mutate'>)
        break
      case 'resize':
        this.resizeListen(effect as unknown as ListenEffect<'resize'>, options as ListenOptions<'resize'>)
        break
      case 'mediaquery':
        this.mediaQueryListen(effect as ListenEffect<'(_)'>, options as ListenOptions<'(_)'>)
        break
      case 'idle':
        this.idleListen(effect as unknown as ListenEffect<'idle'>, options as ListenOptions<'idle'>)
        break
      case 'message':
        this.messageListen(effect as unknown as ListenEffect<'message'>, options as ListenOptions<'message'>)
        break
      case 'recognizeable':
        // @ts-ignore
        this.recognizeableListen(effect as ListenEffect<Type>, options as ListenOptions<Type>)
        break
      case 'documentevent':
        this.documentEventListen(effect as ListenEffect<'visibilitychange'>, options as ListenOptions<'visibilitychange'>)
        break
      case 'event':
        this.eventListen(effect as ListenEffect<ListenableSupportedEventType>, options as ListenOptions<ListenableSupportedEventType>)
        break
    }

    this.listening()

    return this
  }
  private intersectionListen (effect: ListenEffect<'intersect'>, options: ListenOptions<'intersect'>) {
    const { target = document.querySelector('html'), observer } = options,
          id = new IntersectionObserver(effect, observer)

    id.observe(target)
    this.active.add({ target, id } as ListenableActive<Type>)
  }
  private mutationListen (effect: ListenEffect<'mutate'>, options: ListenOptions<'mutate'>) {
    const { target = document.querySelector('html'), observe } = options,
          id = new MutationObserver(effect)

    id.observe(target, observe)
    this.active.add({ target, id } as ListenableActive<Type>)
  }
  private resizeListen (effect: ListenEffect<'resize'>, options: ListenOptions<'resize'>) {
    const { target = document.querySelector('html'), observe } = options,
          id = new ResizeObserver(effect)

    id.observe(target, observe)
    this.active.add({ target, id } as ListenableActive<Type>)
  }
  private mediaQueryListen (effect: ListenEffect<'(_)'>, options: ListenOptions<'(_)'>) {
    const target = window.matchMedia(this.type)

    if (predicateFunction(options.instantEffect)) {
      (options.instantEffect as ListenOptions<'(_)'>['instantEffect'])(target)
    }

    const withApi = (event: ListenEffectParam<'(_)'>) => effect(event)

    target.addEventListener('change', withApi)
    this.active.add({ target, id: ['change', withApi] } as ListenableActive<Type>)
  }
  private idleListen (effect: ListenEffect<'idle'>, options: ListenOptions<'idle'>) {
    const { requestIdleCallback } = options,
          id = window.requestIdleCallback(deadline => effect(deadline), requestIdleCallback)

    this.active.add({ target: window, id } as ListenableActive<Type>)
  }
  private messageListen (effect: ListenEffect<'message'>, options: ListenOptions<'message'>) {
    const { target = new BroadcastChannel('baleada') } = options

    target.addEventListener(this.type as 'message', event => effect(event))
    this.active.add({ target, id: [this.type, effect] } as ListenableActive<Type>)
  }
  private recognizeableListen (effect: (sequenceItem: ListenEffectParam<Type>) => any, options: ListenOptions<Type>) {
    const guardedEffect = (sequenceItem: ListenEffectParam<Type>) => {
      this.recognizeable.recognize(sequenceItem, { onRecognized: sequenceItem => effect(sequenceItem) })

      if (this.recognizeable.status === 'recognized') effect(sequenceItem)
    }

    for (const type of this.recognizeableEffectsKeys) {
      const listenable = new Listenable(type)
      listenable.listen(guardedEffect as ListenEffect<Type>, options)
      this.active.add({ id: listenable } as ListenableActive<Type>)
    }
  }
  private documentEventListen (effect: ListenEffect<'visibilitychange'>, options: ListenOptions<'visibilitychange'>) {
    // Override the target option with document
    const narrowedOptions = {
      ...options,
      target: document,
    }
    
    this.eventListen(effect, narrowedOptions)
  }
  private eventListen<EventType extends ListenableSupportedEventType> (effect: ListenEffect<EventType>, options: ListenOptions<EventType>) {
    const { exceptAndOnlyEffect, effectOptions } = toAddEventListenerParams(this.type as EventType, effect, options),
          eventListeners: ListenableActiveEventId<EventType>[] = [[this.type as EventType, exceptAndOnlyEffect, ...effectOptions]]

    this.addEventListeners(eventListeners, options)
  }
  private addEventListeners<EventType extends ListenableSupportedEventType> (eventListeners: ListenableActiveEventId<EventType>[], options: ListenOptions<EventType>) {
    const { target = document } = options

    eventListeners.forEach(eventListener => {
      target.addEventListener(eventListener[0], eventListener[1], eventListener[2])
      // @ts-ignore
      this.active.add({ target, id: eventListener })
    })
  }
  private listening () {
    this.computedStatus = 'listening'
  }

  stop (options: { target?: Element | Document | (Window & typeof globalThis) } = {}) {
    const { target } = options

    switch (this.status) {
      case 'ready':
      case undefined:
        // Do nothing. This call is coming from the initial setType
        // and shouldn't use web APIs during construction.
        break
      default:
        const stoppables: ListenableActive<Type>[] = [...this.active].filter(active => !target || ('target' in active ? active.target === target : false)),
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
    this.computedStatus = 'stopped'
  }
}

function stop<Type extends ListenableSupportedType> (stoppable: ListenableActive<Type>) {
  if (stoppable.id instanceof Listenable) {
    stoppable.id.stop()
    return
  }

  if (some<string>(type => observerAssertionsByType[type](stoppable.id))(['intersect', 'mutate', 'resize'])) {
    const { id } = stoppable as ListenableActive<'intersect' | 'mutate' | 'resize'>
    id.disconnect()
    return
  }

  if ('target' in stoppable && stoppable.target instanceof MediaQueryList) {
    const { target, id } = stoppable as ListenableActive<'(_)'>
    target.removeEventListener(id[0], id[1])
    return
  }
  
  if (predicateNumber(stoppable.id)) {
    const { target, id } = stoppable as ListenableActive<'idle'>
    target.cancelIdleCallback(id)
    return
  }

  if ('target' in stoppable && stoppable.target instanceof BroadcastChannel) {
    const { target, id } = stoppable as ListenableActive<'message'>
    target.removeEventListener(id[0], id[1])
    return
  }
  
  const { target, id } = stoppable as ListenableActive<ListenableSupportedEventType>
  // @ts-ignore
  target.removeEventListener(id[0], id[1], id[2])
}

export function toImplementation (type: string) {
  return find<ListenableImplementation>(implementation => predicatesByImplementation.get(implementation)(type))(predicatesByImplementation.keys()) as ListenableImplementation
}

type ListenableImplementation = 'recognizeable' | 'intersection' | 'mutation' | 'resize' | 'mediaquery' | 'idle' | 'message' | 'documentevent' | 'event'

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
    'message',
    type => type === 'message' || type === 'messageerror'
  ],
  [
    'documentevent',
    type => documentEvents.has(type)
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
}

export function toAddEventListenerParams<Type extends ListenableSupportedEventType> (type: Type, effect: ListenEffect<Type>, options: ListenOptions<Type>) {
  const { addEventListener, useCapture } = options,
        exceptAndOnlyEffect = createExceptAndOnlyEffect(type, effect, options),
        effectOptions: [optionsOrUseCapture: AddEventListenerOptions | boolean] = [addEventListener || useCapture]

  return { exceptAndOnlyEffect, effectOptions }
}

export function eventMatchesKeycombo (event: KeyboardEvent, keycombo: ListenableKeycomboItem[]): boolean {
  return every<ListenableKeycomboItem>(({ name, type }, index) => {
    switch (type) {
      case 'singleCharacter':
        if (name === '!') return event.key === '!'

        const keyToTest = event.altKey && fromComboItemNameToType(event.key) === 'custom'
          ? fromCodeToSingleCharacter(event.code)
          : event.key.toLowerCase()

        return name.startsWith('!')
          ? keyToTest !== toKey(name.slice(1)).toLowerCase()
          : keyToTest === toKey(name).toLowerCase()
      case 'other':
        if (name === '!') {
          return event.key === '!'
        }

        return name.startsWith('!')
          ? event.key.toLowerCase() !== toKey(name.slice(1)).toLowerCase()
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
          ? !predicateModified({ event, alias: name.slice(1) })
          : predicateModified({ event, alias: name })
    }
  })(keycombo) as boolean
}

export function fromCodeToSingleCharacter (code: KeyboardEvent['code']): string {
  for (const c in aliasesByCode) {
    if (c === code) {
      return aliasesByCode[c]
    }
  }

  for (const prefix of ['Key', 'Digit']) {
    const re = new RegExp(`^${prefix}`)
    if (re.test(code)) {
      return createClip(re)(code).toLowerCase()
    }
  }

  // This will likely fail silently
  return code
}

const aliasesByCode = {
  'Backquote': '`',
  'Minus': '-',
  'Equal': '=',
  'BracketLeft': '[',
  'BracketRight': ']',
  'Backslash': '\\',
  'Semicolon': ';',
  'Quote': '\'',
  'Comma': ',',
  'Period': '.',
  'Slash': '/'
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

export function eventMatchesMousecombo (event: MouseEvent, Mousecombo: string[]): boolean {
  return every<string>(name => (
    fromComboItemNameToType(name) === 'click'
    ||
    (name.startsWith('!') && !predicateModified({ alias: name.slice(1), event }))
    ||
    (!name.startsWith('!') && predicateModified({ alias: name, event }))
  ))(Mousecombo) as boolean
}

export function eventMatchesPointercombo (event: PointerEvent, pointercombo: string[]): boolean {
  return every<string>(name => (
    fromComboItemNameToType(name) === 'pointer'
    ||
    (name.startsWith('!') && !predicateModified({ alias: name.slice(1), event }))
    ||
    (!name.startsWith('!') && predicateModified({ alias: name, event }))
  ))(pointercombo) as boolean
}

const observerAssertionsByType: Record<string, (observer: unknown) => boolean> = {
  intersect: observer => observer instanceof IntersectionObserver,
  mutate: observer => observer instanceof MutationObserver,
  resize: observer => observer instanceof ResizeObserver,
}
