import { Recognizeable } from './Recognizeable'
import type { RecognizeableSupportedEvent, RecognizeableOptions } from './Recognizeable'
import {
  isArray,
  isNumber,
  toKey,
  toCombo,
  comboItemNameToType,
  toModifier,
} from '../util'
import type { ListenableModifier, ListenableModifierAlias } from '../util'

type ListenableSupportedType = IntersectionObserverEntry | MutationRecord | ResizeObserverEntry | MediaQueryListEvent | IdleDeadline | KeyboardEvent | MouseEvent | CustomEvent | Event
type ListenableSupportedEvent = KeyboardEvent | MouseEvent | CustomEvent | Event

type ListenableOptions<EventType> = 
  EventType extends RecognizeableSupportedEvent ? { recognizeable?: RecognizeableOptions<EventType> } :
  {}

type ListenCallback<EventType> = 
  EventType extends IntersectionObserverEntry ? IntersectionObserverCallback :
  EventType extends MutationRecord ? MutationCallback :
  EventType extends ResizeObserverEntry ? ResizeObserverCallback :
  EventType extends IdleDeadline ? IdleRequestCallback :
  EventType extends MediaQueryListEvent | KeyboardEvent | MouseEvent | CustomEvent | Event ? (event: EventType) => any :
  () => void

type ListenOptions<EventType> = 
  EventType extends IntersectionObserverEntry ? { observer?: IntersectionObserverInit } & ObservationListenOptions :
  EventType extends MutationRecord ? { observe?: MutationObserverInit } & ObservationListenOptions :
  EventType extends ResizeObserverEntry ? { observe?: ResizeObserverOptions } & ObservationListenOptions :
  EventType extends MediaQueryListEvent ? {} :
  EventType extends KeyboardEvent ? { comboDelimiter?: string, keyDirection?: 'up' | 'down' } & EventListenOptions :
  EventType extends MouseEvent ? { comboDelimiter?: string } & EventListenOptions :
  EventType extends CustomEvent | Event ? EventListenOptions :
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

type ListenableActive<EventType> = 
  EventType extends IntersectionObserverEntry ? { target: Element, id: IntersectionObserver } :
  EventType extends MutationRecord ? { target: Element, id: MutationObserver } :
  EventType extends ResizeObserverEntry ? { target: Element, id: ResizeObserver } :
  EventType extends MediaQueryListEvent ? { target: MediaQueryList, id: [type: string, listener: ListenCallback<EventType>] } :
  EventType extends IdleDeadline ? { target: Window & typeof globalThis, id: number } :
  EventType extends KeyboardEvent | MouseEvent | CustomEvent | Event ? { target: Element | Document, id: ListenableActiveEventId<EventType> } :
  { id: any }

type ListenableActiveEventId<EventType> = [
  type: string,
  exceptAndOnlyListener: ListenCallback<EventType>,
  optionsOrUseCapture: AddEventListenerOptions | boolean,
]

export class Listenable<EventType extends ListenableSupportedType> {
  _computedRecognizeable: Recognizeable<RecognizeableSupportedEvent>
  _computedRecognizeableEvents: string[]
  _computedActive: Set<ListenableActive<EventType>>
  constructor (type: string, options?: ListenableOptions<EventType>) {
    if (type === 'recognizeable') { // Based on the type param, can assume that EventType is a safe type
      const recognizeableOptions = (options as ListenableOptions<RecognizeableSupportedEvent>).recognizeable as RecognizeableOptions<RecognizeableSupportedEvent>
      this._computedRecognizeable = new Recognizeable([], recognizeableOptions)
      this._computedRecognizeableEvents = Object.keys(recognizeableOptions?.handlers || {})
    }    

    this._computedActive = new Set()

    this.setType(type)
    this._ready()
  }
  _computedStatus: 'ready' | 'listening' | 'stopped'
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
  _computedImplementation: ListenableImplementation
  setType (type: string) {
    this.stop()
    this._computedType = type
    this._computedImplementation = toImplementation(type)
    return this
  }

  listen (listener: ListenCallback<EventType>, options?: ListenOptions<EventType>) {
    switch (this._computedImplementation) {
      case 'intersection':
        this._intersectionListen(listener as ListenCallback<IntersectionObserverEntry>, options as ListenOptions<IntersectionObserverEntry>)
        break
      case 'mutation':
        this._mutationListen(listener as ListenCallback<MutationRecord>, options as ListenOptions<MutationRecord>)
        break
      case 'resize':
        this._resizeListen(listener as ListenCallback<ResizeObserverEntry>, options as ListenOptions<ResizeObserverEntry>)
        break
      case 'mediaquery':
        this._mediaQueryListen(listener as (event: MediaQueryListEvent) => any)
        break
      case 'idle':
        this._idleListen(listener as ListenCallback<IdleDeadline>, options as ListenOptions<IdleDeadline>)
        break
      case 'recognizeable':
        this._recognizeableListen(listener as ListenCallback<RecognizeableSupportedEvent>, options as ListenOptions<RecognizeableSupportedEvent>)
        break
      case 'visibilitychange':
        this._visibilityChangeListen(listener as ListenCallback<Event>, options as ListenOptions<Event>)
        break
      case 'keycombo':
        this._keycomboListen(listener as ListenCallback<KeyboardEvent>, options as ListenOptions<KeyboardEvent>)
        break
      case 'leftclickcombo':
      case 'rightclickcombo':
        this._clickcomboListen(listener as ListenCallback<MouseEvent>, options as ListenOptions<MouseEvent>)
        break
      case 'event':
        this._eventListen(listener as ListenCallback<ListenableSupportedEvent>, options as ListenOptions<ListenableSupportedEvent>)
        break
      }

    this._listening()

    return this
  }
  _intersectionListen (listener: ListenCallback<IntersectionObserverEntry>, options: ListenOptions<IntersectionObserverEntry>) {
    const { target = document.querySelector('html'), observer } = options,
          id = new IntersectionObserver(listener, observer)

    id.observe(target)
    this.active.add({ target, id } as ListenableActive<EventType>)
  }
  _mutationListen (listener: ListenCallback<MutationRecord>, options: ListenOptions<MutationRecord>) {
    const { target = document.querySelector('html'), observe } = options,
          id = new MutationObserver(listener)

    id.observe(target, observe)
    this.active.add({ target, id } as ListenableActive<EventType>)
  }
  _resizeListen (listener: ListenCallback<ResizeObserverEntry>, options: ListenOptions<ResizeObserverEntry>) {
    const { target = document.querySelector('html'), observe } = options,
          id = new ResizeObserver(listener)

    id.observe(target, observe)
    this.active.add({ target, id } as ListenableActive<EventType>)
  }
  _mediaQueryListen (listener: ListenCallback<MediaQueryListEvent>) {
    const target = window.matchMedia(this.type)

    target.addEventListener('change', listener)
    this.active.add({ target, id: ['change', listener] } as ListenableActive<EventType>)
  }
  _idleListen (listener: ListenCallback<IdleDeadline>, options: ListenOptions<IdleDeadline>) {
    const { requestIdleCallback } = options,
          id = window.requestIdleCallback(listener, requestIdleCallback)

    this.active.add({ target: window, id } as ListenableActive<EventType>)
  }
  _recognizeableListen (listener: ListenCallback<RecognizeableSupportedEvent>, options: ListenOptions<RecognizeableSupportedEvent>) {
    const { exceptAndOnlyListener, listenerOptions } = toAddEventListenerParams<RecognizeableSupportedEvent>(listener, options),
          eventListeners = this._computedRecognizeableEvents.map(name => {
            return [name, (event: RecognizeableSupportedEvent) => {
              this.recognizeable.recognize(event)

              if (this.recognizeable.status === 'recognized') {
                exceptAndOnlyListener(event)
              }
            }, ...listenerOptions]
          })

    this.recognizeable.setListener(exceptAndOnlyListener)

    this._addEventListeners(eventListeners as ListenableActiveEventId<ListenableSupportedEvent>[], options)
  }
  _visibilityChangeListen (listener: ListenCallback<Event>, options: ListenOptions<Event>) {
    const ensuredOptions = {
      ...options,
      target: document,
    }
    
    this._eventListen(listener as ListenCallback<ListenableSupportedEvent>, ensuredOptions as ListenOptions<ListenableSupportedEvent>)
  }
  _keycomboListen (listener: ListenCallback<KeyboardEvent>, options: ListenOptions<KeyboardEvent>) {
    const combo = toCombo(this.type, options.comboDelimiter).map(name => ({ name, type: comboItemNameToType(name) })),
          guardedListener = (event: KeyboardEvent) => {            
            if (eventMatchesKeycombo({ event, combo })) {
              listener(event)
            }
          }
    
    this._eventListen(guardedListener as ListenCallback<ListenableSupportedEvent>, options as ListenOptions<ListenableSupportedEvent>)
  }
  _clickcomboListen (listener: ListenCallback<MouseEvent>, options: ListenOptions<MouseEvent>) {
    const combo = toCombo(this.type, options.comboDelimiter),
          guardedListener = (event: MouseEvent) => {
            if (eventMatchesClickcombo({ event, combo })) {
              listener(event)
            }
          }
    
    this._eventListen(guardedListener as ListenCallback<ListenableSupportedEvent>, options as ListenOptions<ListenableSupportedEvent>)
  }
  _eventListen (listener: ListenCallback<ListenableSupportedEvent>, options: ListenOptions<ListenableSupportedEvent>) {
    const type = (() => {
      switch (this._computedImplementation) {
        case 'keycombo':
          return `key${(options as ListenOptions<KeyboardEvent>).keyDirection || 'down'}`
        case 'leftclickcombo': // click | mousedown | mouseup
          return this.type.match(/(\w+)$/)[1]
        case 'rightclickcombo':
          return 'contextmenu'
        default:
          return this.type
      }
    })()

    const { exceptAndOnlyListener, listenerOptions } = toAddEventListenerParams<ListenableSupportedEvent>(listener, options),
          eventListeners: ListenableActiveEventId<ListenableSupportedEvent>[] = [[type, exceptAndOnlyListener, ...listenerOptions]]

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
        const stoppables = [...this.active].filter(active => !('target' in active) || active.target === target), // Normally would use .isSameNode() here, but it needs to support MediaQueryLists too
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

function stop<EventType> (stoppable: ListenableActive<EventType>) {
  if ([IntersectionObserver, MutationObserver, ResizeObserver].some(observer => stoppable.id instanceof observer)) {
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
  leftclickcombo: /^(!?((cmd|command|meta|shift|ctrl|control|alt|opt))\+){0,4}(click|mousedown|mouseup)$/,
  rightclickcombo: /^(!?((cmd|command|meta|shift|ctrl|control|alt|opt))\+){0,4}rightclick$/,
}

export function toAddEventListenerParams<EventType extends ListenableSupportedEvent> (listener: (event: EventType) => any, options: ListenOptions<EventType>) {
  const { addEventListener, useCapture } = options,
        exceptAndOnlyListener = createExceptAndOnlyListener<EventType>(listener, options),
        listenerOptions: [optionsOrUseCapture: AddEventListenerOptions | boolean] = [addEventListener || useCapture]

  return { exceptAndOnlyListener, listenerOptions }
}

export function createExceptAndOnlyListener<EventType extends ListenableSupportedEvent> (listener: (event: EventType) => any, options: ListenOptions<EventType>): (event: EventType) => any {
  const { except = [], only = [] } = options
  
  return (event: EventType) => {
    const { target } = event,
          [matchesOnly, matchesExcept] = [only, except].map(selectors => selectors.some(selector => (target as Element).matches(selector)))

    if (matchesOnly) {
      listener(event)
      return
    }
    
    if (only.length === 0 && !matchesExcept) {
      listener(event)
      return
    }
  }
}

export function eventMatchesKeycombo ({ event, combo }: { event: KeyboardEvent, combo: ({ name: string, type: string })[] }): boolean {
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
        return predicatesByArrow[name]?.({ event, name }) ?? predicatesByArrow.default({ event, name })
      case 'modifier':
        if (index === combo.length - 1) {
          return name.startsWith('!')
            ? event.key.toLowerCase() !== toModifier(name.slice(1) as ListenableModifier | ListenableModifierAlias).toLowerCase()
            : event.key.toLowerCase() === toModifier(name as ListenableModifier | ListenableModifierAlias).toLowerCase()
        }

        return name.startsWith('!')
          ? !isModified({ event, alias: name.slice(1) })
          : isModified({ event, alias: name })
    }
  })
}

type ListenableArrowAlias = 'arrow' | '!arrow' | 'vertical' | '!vertical' | 'horizontal' | '!horizontal' | 'default'
const predicatesByArrow: Record<ListenableArrowAlias, (required: { event: KeyboardEvent, name?: string }) => boolean> = {
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


type ListenableClickComboItem = ListenableModifier | ListenableModifierAlias | 'click'
export function eventMatchesClickcombo ({ event, combo }: { event: MouseEvent, combo: string[] }): boolean {
  return combo.every(name => (
    comboItemNameToType(name) === 'click'
    ||
    (name.startsWith('!') && !isModified({ alias: name.slice(1), event }))
    ||
    (!name.startsWith('!') && isModified({ alias: name, event }))
  ))
}
