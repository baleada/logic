import { isArray, isNumber } from '../util'
import { createInsert } from '../pipes'

export type RecognizeableSupportedEvent = KeyboardEvent | MouseEvent

export type RecognizeableOptions<EventType> = {
  maxSequenceLength?: true | number,
  handlers?: Record<any, (api: RecognizeableHandlerApi<EventType>) => any>
}

type HandlerApiFromConstructor<EventType> = {
  toPolarCoordinates: typeof toPolarCoordinates,
  getStatus: () => 'recognized' | 'recognizing' | 'denied' | 'ready',
  getMetadata: (param?: { path: string }) => any,
  setMetadata: (required: { path: string, value: any }) => void,
  pushMetadata: (required: { path: string, value: any }) => void,
  insertMetadata: (required: { path: string, value: any, index: number }) => void,
  recognized: () => void,
  denied: () => void,
  listener: (event: EventType) => any,
}

type HandlerApiFromRuntime<EventType> = {
  event: EventType,
  getSequence: () => EventType[]
}

export type RecognizeableHandlerApi<EventType> = HandlerApiFromConstructor<EventType> & HandlerApiFromRuntime<EventType>

export class Recognizeable<EventType extends RecognizeableSupportedEvent> {
  _maxSequenceLength: number | true
  _handlers: Record<any, (api: RecognizeableHandlerApi<EventType>) => any>
  _handlerApi: HandlerApiFromConstructor<EventType>

  constructor (sequence: EventType[], options: RecognizeableOptions<EventType> = {}) {
    const defaultOptions: RecognizeableOptions<EventType> = {
      maxSequenceLength: true as const,
      handlers: {},
    }
    
    this._maxSequenceLength = options?.maxSequenceLength || defaultOptions.maxSequenceLength // 0 and false are not allowed
    this._handlers = options?.handlers || defaultOptions.handlers

    this._resetComputedMetadata()

    this.setSequence(sequence)

    this._handlerApi = {
      toPolarCoordinates,
      getStatus: () => this.status,
      getMetadata: param => param ? get({ object: this.metadata, ...param }) : this.metadata,
      setMetadata: required => this._setMetadata(required),
      pushMetadata: required => this._pushMetadata(required),
      insertMetadata: required => this._insertMetadata(required),
      recognized: () => this._recognized(),
      denied: () => this._denied(),
      listener: event => this.listener?.(event),
    }

    this._ready()
  }

  _computedMetadata: Record<any, any>
  _resetComputedMetadata () {
    this._computedMetadata = {}
  }
  
  _recognized () {
    this._computedStatus = 'recognized'
  }
  _denied () {
    this._computedStatus = 'denied'
  }
  _computedStatus: 'recognized' | 'recognizing' | 'denied' | 'ready'
  _ready () {
    this._computedStatus = 'ready'
  }

  _setMetadata ({ path, value }: { path: string, value: any }) {
    set({ object: this.metadata, path, value })
  }
  _pushMetadata ({ path, value }: { path: string, value: any }) {
    this._ensureArray({ path })
    push({ object: this.metadata, path, value })
  }
  _insertMetadata ({ path, value, index }: { path: string, value: any, index: number }) {
    this._ensureArray({ path })
    insert({ object: this.metadata, path, value, index })
  }
  _ensureArray ({ path }: { path: string }) {
    const currentValue = (() => {
      try {
        return get({ object: this.metadata, path })
      } catch (error) {
        return undefined
      }
    })()

    if (!isArray(currentValue)) {
      this._setMetadata({ path, value: [] })
    }
  }

  get sequence () {
    return this._computedSequence
  }
  set sequence (sequence) {
    this.setSequence(sequence)
  }
  get listener () {
    return this._computedListener
  }
  set listener (listener) {
    this.setListener(listener)
  }
  get status () {
    return this._computedStatus
  }
  get metadata () {
    return this._computedMetadata
  }

  _computedSequence: EventType[]
  setSequence (sequence: EventType[]) {
    this._computedSequence = Array.from(sequence)
    return this
  }
  _computedListener: ((event: EventType) => any)
  setListener (listener: ((event: EventType) => any)) {
    this._computedListener = listener
    return this
  }

  recognize (event: EventType) {
    this._recognizing()

    const { type } = event,
          excess = isNumber(this._maxSequenceLength)
            ? Math.max(0, this.sequence.length - this._maxSequenceLength)
            : 0,
          newSequence = [ ...this.sequence.slice(excess), event ]

    this._handlers[type]?.({
      event,
      ...this._handlerApi,
      getSequence: () => newSequence,
    })
      
    switch (this.status) {
      case 'denied':
        this._resetComputedMetadata()
        this.setSequence([])
        break
      case 'recognizing':
      case 'recognized':
        this.setSequence(newSequence)
        break
    }

    return this
  }
  _recognizing () {
    this._computedStatus = 'recognizing'
  }
}

export function toPolarCoordinates (
  { xA, xB, yA, yB }: { xA: number, xB: number, yA: number, yB: number }
): {
  distance: number,
  angle: { radians: number, degrees: number }
} {
  const distance = Math.hypot(xB - xA, yB - yA),
        angle = Math.atan2((yA - yB), (xB - xA)),
        radians = angle >= 0
          ? angle
          : 2 * Math.PI + angle,
        degrees = radians * 180 / Math.PI

  return {
    distance,
    angle: { radians, degrees }
  }
}

export function get ({ object, path }: { object: Record<any, any>, path: string }): any {
  return toKeys(path).reduce((gotten, key) => {
    if (!Array.isArray(gotten)) {
      return gotten[key]
    }

    return key === 'last'
      ? gotten[gotten.length - 1]
      : gotten[key]
  }, object)
}

export function toKeys (path: string): (string | number)[] {
  return path
    ? path
      .split('.')
      .map(key => isNaN(Number(key)) ? key : Number(key))
    : []
}

export function set ({ object, path, value }: { object: Record<any, any>, path: string, value: any }): void {
  toKeys(path).forEach((key, index, array) => {
    if (array.length === 1) {
      object[key] = value
      return
    }

    const p = toPath(array.slice(0, index))

    if (!p) {
      maybeAssign({
        gotten: object[key],
        key,
        assign: value => (object[key] = value)
      })
    } else {
      maybeAssign({
        gotten: get({ object, path: p }),
        key,
        assign: value => set({ object, path: p, value })
      })
    }

    if (index === array.length - 1) {
      get({ object, path: p })[key] = value
    }
  })
}

function toPath (keys: (string | number)[]): string {
  return keys
    .map(key => typeof key === 'string' ? key : `${key}`)
    .reduce((path, key) => `${path}${'.' + key}`, '')
    .replace(/^\./, '')
}

function maybeAssign ({ gotten, key, assign }: { gotten: any, key: string | number, assign: (value: any) => void }): void {
  if (gotten === undefined) {
    switch (typeof key) {
      case 'number':
        assign([])
      case 'string':
        assign({})
    }
  }
}

export function push ({ object, path, value }: { object: Record<any, any>, path: string, value: any }): void {  
  const array = get({ object, path })
  set({ object, path, value: [...array, value] })
}

export function insert ({ object, path, value, index }: { object: Record<any, any>, path: string, value: any, index: number }): void {
  const inserted = createInsert({ item: value, index })(get({ object, path }))
  
  set({ object, path, value: inserted })
}
