import {
  some as lazyCollectionSome,
  every as lazyCollectionEvery,
  find as lazyCollectionFind,
} from 'lazy-collections'
import { Recognizeable, createDefineEffect } from './Recognizeable'
import type { RecognizeableOptions, RecognizeableEffectApi } from './Recognizeable'
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
  createExceptAndOnlyEffect,
  isFunction,
} from '../extracted'
import type {
  ListenableModifier,
  ListenableModifierAlias,
  ListenableKeycomboItem,
} from '../extracted'
import { createReduce } from '../pipes'

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

export type ListenableClickcombo = `${string}+${ListenableLeftClick | ListenableRightClick}`
type ListenableLeftClick = 'click' | 'mousedown' | 'mouseup' | 'dblclick'
type ListenableRightClick = 'rightclick' | 'contextmenu'

export type ListenablePointercombo =  `${string}+${ListenablePointer}`
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

export type ListenableOptions<Type extends ListenableSupportedType, RecognizeableMetadata extends Record<any, any> = Record<any, any>> = { recognizeable?: RecognizeableOptions<Type, RecognizeableMetadata> }

export type ListenEffect<Type extends ListenableSupportedType> = 
  Type extends 'intersect' ? (entries: ListenEffectParam<Type>) => any :
  Type extends 'mutate' ? (records: ListenEffectParam<Type>) => any :
  Type extends 'resize' ? (entries: ListenEffectParam<Type>) => any :
  Type extends 'idle' ? (deadline: ListenEffectParam<Type>) => any :
  Type extends ListenableMediaQuery ? (event: ListenEffectParam<Type>) => any :
  Type extends ListenableClickcombo ? (event: ListenEffectParam<Type>) => any :
  Type extends ListenablePointercombo ? (event: ListenEffectParam<Type>) => any :
  Type extends ListenableKeycombo ? (event: ListenEffectParam<Type>) => any :
  Type extends keyof Omit<HTMLElementEventMap, 'resize'> ? (event: ListenEffectParam<Type>) => any :
  Type extends keyof Omit<DocumentEventMap, 'resize'> ? (event: ListenEffectParam<Type>) => any :
  never

export type ListenEffectParam<Type extends ListenableSupportedType> = 
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
  Type extends ListenableMediaQuery ? { target: MediaQueryList, id: [type: string, effect: ListenEffect<Type>] } :
  Type extends ListenableSupportedEventType ? { target: Element | Document, id: ListenableActiveEventId<Type> } :
  { id: Listenable<Type, RecognizeableMetadata> }

type ListenableActiveEventId<Type extends ListenableSupportedEventType> = [
  type: string,
  exceptAndOnlyEffect: ListenEffect<Type>,
  optionsOrUseCapture: AddEventListenerOptions | boolean,
]

export type ListenableStatus = 'ready' | 'listening' | 'stopped'

export class Listenable<Type extends ListenableSupportedType, RecognizeableMetadata extends Record<any, any> = Record<any, any>> {
  private computedRecognizeable: Recognizeable<Type, RecognizeableMetadata>
  private recognizeableEffectsKeys: Type[]
  private computedActive: Set<ListenableActive<Type, RecognizeableMetadata>>
  constructor (type: Type, options?: ListenableOptions<Type, RecognizeableMetadata>) {
    if (type === 'recognizeable') {
      // Recognizeable options are ensured as an object here because `effects` keys need to be extracted and stored in the Listenable instance
      const recognizeableOptions = {
        ...(options?.recognizeable || {}),
        effects: isFunction(options?.recognizeable?.effects)
          ? createReduce<
              [type: Type, effect: (api: RecognizeableEffectApi<Type, RecognizeableMetadata>) => any],
              { [type in Type]?: (api: RecognizeableEffectApi<Type, RecognizeableMetadata>) => any }
            >((effects, [type, effect]) => {
              effects[type] = effect
              return effects
            }, {})(options.recognizeable.effects(createDefineEffect<Type, RecognizeableMetadata>()))
          : options?.recognizeable?.effects || {} as { [type in Type]?: (api: RecognizeableEffectApi<Type, RecognizeableMetadata>) => any }
      }

      this.computedRecognizeable = new Recognizeable<Type, RecognizeableMetadata>([], recognizeableOptions)
      this.recognizeableEffectsKeys = Object.keys(recognizeableOptions.effects) as Type[]
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
        this.mediaQueryListen(effect as ListenEffect<'(_)'>)
        break
      case 'idle':
        this.idleListen(effect as unknown as ListenEffect<'idle'>, options as ListenOptions<'idle'>)
        break
      case 'recognizeable':
        this.recognizeableListen(effect as ListenEffect<Type>, options as ListenOptions<Type>)
        break
      case 'documentevent':
        this.documentEventListen(effect as ListenEffect<'visibilitychange'>, options as ListenOptions<'visibilitychange'>)
        break
      case 'keycombo':
        this.keycomboListen(effect as ListenEffect<'cmd+b'>, options as ListenOptions<'cmd+b'>)
        break
      case 'leftclickcombo':
      case 'rightclickcombo':
        this.clickcomboListen(effect as ListenEffect<'cmd+click'>, options as ListenOptions<'cmd+click'>)
        break
      case 'pointercombo':
        this.pointercomboListen(effect as ListenEffect<'cmd+click'>, options as ListenOptions<'cmd+click'>)
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
  private mediaQueryListen (effect: ListenEffect<'(_)'>) {
    const target = window.matchMedia(this.type)

    target.addEventListener('change', effect)
    this.active.add({ target, id: ['change', effect] } as ListenableActive<Type>)
  }
  private idleListen (effect: ListenEffect<'idle'>, options: ListenOptions<'idle'>) {
    const { requestIdleCallback } = options,
          id = window.requestIdleCallback(effect, requestIdleCallback)

    this.active.add({ target: window, id } as ListenableActive<Type>)
  }
  private recognizeableListen (effect: (sequenceItem: ListenEffectParam<Type>) => any, options: ListenOptions<Type>) {
    const guardedEffect = (sequenceItem: ListenEffectParam<Type>) => {
      this.recognizeable.recognize(sequenceItem, { onRecognized: effect })

      if (this.recognizeable.status === 'recognized') {
        effect(sequenceItem)
      }
    }

    for (const type of this.recognizeableEffectsKeys) {
      console.log(type)
      const listenable = new Listenable(type)
      listenable.listen(guardedEffect as ListenEffect<Type>, options)
      this.active.add({ id: listenable } as ListenableActive<Type>)
    }
  }
  private documentEventListen (effect: ListenEffect<'visibilitychange'>, options: ListenOptions<'visibilitychange'>) {
    // Override the target option with document
    const ensuredOptions = {
      ...options,
      target: document,
    }
    
    this.eventListen(effect, ensuredOptions)
  }
  private pointercomboListen (effect: ListenEffect<'cmd+pointerdown'>, options: ListenOptions<'cmd+pointerdown'>) {
    const pointercombo = ensurePointercombo(this.type),
          guardedEffect = (event: PointerEvent) => {
            if (eventMatchesPointercombo({ event, pointercombo })) {
              effect(event)
            }
          }
    
    this.eventListen(guardedEffect, options)
  }
  private clickcomboListen (effect: ListenEffect<'cmd+click'>, options: ListenOptions<'cmd+click'>) {
    const clickcombo = ensureClickcombo(this.type),
          guardedEffect = (event: MouseEvent) => {
            if (eventMatchesClickcombo({ event, clickcombo })) {
              effect(event)
            }
          }
    
    this.eventListen(guardedEffect, options)
  }
  private keycomboListen (effect: ListenEffect<'cmd+b'>, options: ListenOptions<'cmd+b'>) {
    const keycombo = ensureKeycombo(this.type),
          guardedEffect = (event: KeyboardEvent) => {            
            if (eventMatchesKeycombo({ event, keycombo })) {
              effect(event)
            }
          }
    
    this.eventListen(guardedEffect, options)
  }
  private eventListen<EventType extends ListenableSupportedEventType> (effect: ListenEffect<EventType>, options: ListenOptions<EventType>) {
    const type = (() => {
      switch (this.implementation) {
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

    const { exceptAndOnlyEffect, effectOptions } = toAddEventListenerParams(effect, options),
          eventListeners: ListenableActiveEventId<EventType>[] = [[type, exceptAndOnlyEffect, ...effectOptions]]

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
    this.computedStatus = 'stopped'
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
  return lazyCollectionFind<ListenableImplementation>(implementation => predicatesByImplementation.get(implementation)(type))(predicatesByImplementation.keys()) as ListenableImplementation
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

export function toAddEventListenerParams<Type extends ListenableSupportedEventType> (effect: ListenEffect<Type>, options: ListenOptions<Type>) {
  const { addEventListener, useCapture } = options,
        exceptAndOnlyEffect = createExceptAndOnlyEffect(effect, options),
        effectOptions: [optionsOrUseCapture: AddEventListenerOptions | boolean] = [addEventListener || useCapture]

  return { exceptAndOnlyEffect, effectOptions }
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
