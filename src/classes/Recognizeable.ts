import {
  map as lazyCollectionMap,
  reduce as lazyCollectionReduce,
  pipe as lazyCollectionPipe,
  join as lazyCollectionJoin,
} from 'lazy-collections'
import {
  isArray,
  isNumber,
  ensureClickcombo,
  ensureKeycombo
} from '../extracted'
import type {
  ListenableKeycomboItem,
  ListenableClickcomboItem,
} from '../extracted'
import {
  createSlice,
  createConcat,
  createMap,
  createReduce,
  Pipeable
} from '../pipes'
import {
  ListenableSupportedEvent,
  eventMatchesClickcombo,
  toImplementation,
  eventMatchesKeycombo
} from './Listenable'

export type RecognizeableSupportedType = 
  IntersectionObserverEntry[]
  | MutationRecord[]
  | ResizeObserverEntry[]
  | MediaQueryListEvent
  | IdleDeadline
  | ListenableSupportedEvent

export type RecognizeableSequenceItem<ListenableEventType> = 
  ListenableEventType extends IntersectionObserverEntry ? IntersectionObserverEntry[] :
  ListenableEventType extends MutationRecord ? MutationRecord[] :
  ListenableEventType extends ResizeObserverEntry ? ResizeObserverEntry[] :
  ListenableEventType

export type RecognizeableOptions<SequenceItem extends RecognizeableSupportedType, Metadata> = {
  maxSequenceLength?: true | number,
  handlersIncludeCombos?: boolean,
  handlers?: Record<any, (api: RecognizeableHandlerApi<SequenceItem, Metadata>) => any>
}

export type RecognizeableStatus = 'recognized' | 'recognizing' | 'denied' | 'ready'

export type RecognizeableHandlerApi<SequenceItem extends RecognizeableSupportedType, Metadata> = HandlerApiFromConstructor<SequenceItem, Metadata> & HandlerApiFromRuntime<SequenceItem>

type HandlerApiFromConstructor<SequenceItem extends RecognizeableSupportedType, Metadata> = {
  toPolarCoordinates: typeof toPolarCoordinates,
  getStatus: () => 'recognized' | 'recognizing' | 'denied' | 'ready',
  getMetadata: () => Metadata,
  setMetadata: (metadata: Metadata) => void,
  recognized: () => void,
  denied: () => void,
  effect: (sequenceItem: SequenceItem) => any,
}

type HandlerApiFromRuntime<SequenceItem extends RecognizeableSupportedType> = {
  sequenceItem: SequenceItem,
  getSequence: () => SequenceItem[]
}

export class Recognizeable<SequenceItem extends RecognizeableSupportedType, Metadata extends Record<any, any> = Record<any, any>> {
  _maxSequenceLength: number | true
  _handlers: Map<string, (api: RecognizeableHandlerApi<SequenceItem, Metadata>) => any>
  _handlerApi: HandlerApiFromConstructor<SequenceItem, Metadata>
  _toType: (sequenceItem: SequenceItem) => string

  constructor (sequence: SequenceItem[], options: RecognizeableOptions<SequenceItem, Metadata> = { handlersIncludeCombos: true }) {
    const defaultOptions: RecognizeableOptions<SequenceItem, Metadata> = {
      maxSequenceLength: true as const,
      handlersIncludeCombos: true,
      handlers: {},
    }
    
    this._maxSequenceLength = options?.maxSequenceLength || defaultOptions.maxSequenceLength // 0 and false are not allowed
    this._handlers = new Map(Object.entries(options?.handlers || defaultOptions.handlers))

    this._toType = createToType({
      handlersIncludeCombos: options.handlersIncludeCombos,
      handlers: this._handlers,
    })

    this._resetComputedMetadata()

    this.setSequence(sequence)

    this._handlerApi = {
      toPolarCoordinates,
      getStatus: () => this.status,
      getMetadata: () => this.metadata,
      setMetadata: (metadata: Metadata) => this._computedMetadata = metadata,
      recognized: () => this._recognized(),
      denied: () => this._denied(),
      effect: (sequenceItem: SequenceItem) => this.effect?.(sequenceItem),
    }

    this._ready()
  }

  _computedMetadata: Metadata
  _resetComputedMetadata () {
    this._computedMetadata = {} as Metadata
  }
  
  _recognized () {
    this._computedStatus = 'recognized'
  }
  _denied () {
    this._computedStatus = 'denied'
  }
  _computedStatus: RecognizeableStatus
  _ready () {
    this._computedStatus = 'ready'
  }

  get sequence () {
    return this._computedSequence
  }
  set sequence (sequence) {
    this.setSequence(sequence)
  }
  get effect () {
    return this._computedEffect
  }
  set effect (effect) {
    this.setEffect(effect)
  }
  get status () {
    return this._computedStatus
  }
  get metadata () {
    return this._computedMetadata
  }

  _computedSequence: SequenceItem[]
  setSequence (sequence: SequenceItem[]) {
    this._computedSequence = sequence
    return this
  }
  _computedEffect: ((sequenceItem: SequenceItem) => any)
  setEffect (effect: ((sequenceItem: SequenceItem) => any)) {
    this._computedEffect = effect
    return this
  }

  recognize (sequenceItem: SequenceItem) {
    this._recognizing()

    const type = this._toType(sequenceItem),
          excess = isNumber(this._maxSequenceLength)
            ? Math.max(0, this.sequence.length - this._maxSequenceLength)
            : 0,
          newSequence = createConcat(
            createSlice<SequenceItem>({ from: excess })(this.sequence),
            [sequenceItem]
          )([])
          
    this._handlers.get(type)?.({
      sequenceItem: sequenceItem,
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

const leftclickcomboEventTypes = new Set(['click', 'mousedown', 'mouseup', 'dblclick'])
const rightclickComboEventTypes = new Set(['contextmenu'])
const keycomboEventTypes = new Set(['keydown', 'keyup'])

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
  const toGotten = createReduce(
    (gotten, key: string | number) => {
      if (!Array.isArray(gotten)) {
        return gotten[key]
      }

      return key === 'last'
        ? gotten[gotten.length - 1]
        : gotten[key]
    },
    object
  )
  
  return new Pipeable(path).pipe(
    toKeys,
    toGotten
  )
}

const keyMap = createMap<string | number>(key => isNaN(Number(key)) ? key : Number(key))
export function toKeys (path: string): (string | number)[] {
  return path
    ? new Pipeable(path).pipe(
        path => path.split('.'),
        keyMap
      ) as (string | number)[]
    : []
}

export function set ({ object, path, value }: { object: Record<any, any>, path: string, value: any }): void {
  toKeys(path).forEach((key, index, array) => {
    if (array.length === 1) {
      object[key] = value
      return
    }

    const p = toPath(createSlice<string | number>({ from: 0, to: index })(array))

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

export function defineRecognizeableOptions<SequenceItem extends RecognizeableSupportedType, Metadata extends Record<any, any> = Record<any, any>> (options: RecognizeableOptions<SequenceItem, Metadata>) {
  return options
}

export function defineRecognizeableHandler<SequenceItem extends RecognizeableSupportedType, Metadata extends Record<any, any> = Record<any, any>> (handler: (api: RecognizeableHandlerApi<SequenceItem, Metadata>) => any) {
  return handler
}

const pathMap = lazyCollectionMap<string | number, string>(key => typeof key === 'string' ? key : `${key}`),
      pathReduce = lazyCollectionReduce<string | number, string>((path, key) => `${path}${'.' + key}`, '')
function toPath (keys: (string | number)[]): string {
  return lazyCollectionPipe(pathMap, pathReduce)(keys)
    .replace(/^\./, '') as string
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

export function createToType<SequenceItem extends RecognizeableSupportedType, Metadata> ({
  handlersIncludeCombos,
  handlers
}: {
 handlersIncludeCombos?: RecognizeableOptions<SequenceItem, Metadata>['handlersIncludeCombos'],
 handlers?: Map<string, (api: RecognizeableHandlerApi<SequenceItem, Metadata>) => any>
}): (sequence: SequenceItem) => string {
  const handlerLeftclickcombos: ListenableClickcomboItem[][] = [],
        handlerRightclickcombos: ListenableClickcomboItem[][] = [],
        handlerKeycombos: ListenableKeycomboItem[][] = []

  if (handlersIncludeCombos) {
    for (const [handlerKey] of handlers) {
      const implementation = toImplementation(handlerKey)

      switch (implementation) {
        case 'leftclickcombo':
          handlerLeftclickcombos.push(ensureClickcombo(handlerKey))
          break
        case 'rightclickcombo':
          handlerRightclickcombos.push(ensureClickcombo(handlerKey))
          break
        case 'keycombo':
          handlerKeycombos.push(ensureKeycombo(handlerKey))
          break
        default:
          // do nothing
          break
      }
    }
  }

  return function toType (sequenceItem: SequenceItem) {
    if (isArray(sequenceItem)) {
      if (sequenceItem[0] instanceof IntersectionObserverEntry) {
        return 'intersect'
      }
  
      if (sequenceItem[0] instanceof MutationRecord) {
        return 'mutate'
      }
      
      if (sequenceItem[0] instanceof ResizeObserverEntry) {
        return 'resize'
      }
    } else {
      if (sequenceItem instanceof MediaQueryListEvent) {
        return sequenceItem.media
      }
    
      if ('didTimeout' in sequenceItem) {
        return 'idle'
      }

      if (handlerLeftclickcombos?.length > 0) {
        if (leftclickcomboEventTypes.has((sequenceItem as Event).type)) {
          for (const clickcombo of handlerLeftclickcombos) {
            if (eventMatchesClickcombo({ event: sequenceItem as MouseEvent, clickcombo })) {
              return toJoinedClickcombo(clickcombo) as string
            }
          }
        }
      }
      
      if (handlerRightclickcombos?.length > 0) {
        if (rightclickComboEventTypes.has((sequenceItem as Event).type)) {
          for (const clickcombo of handlerRightclickcombos) {
            if (eventMatchesClickcombo({ event: sequenceItem as MouseEvent, clickcombo })) {
              return toJoinedClickcombo(clickcombo) as string
            }
          }
        }
      }
      
      if (handlerKeycombos?.length > 0) {
        if (keycomboEventTypes.has((sequenceItem as Event).type)) {
          for (const keycombo of handlerKeycombos) {
            if (eventMatchesKeycombo({ event: sequenceItem as KeyboardEvent, keycombo })) {
              return toJoinedKeycombo(keycombo) as string
            }
          }
        }
      }
    
      return (sequenceItem as Event).type
    }
  }
}

const toJoinedClickcombo = lazyCollectionJoin('+'),
      toJoinedKeycombo = lazyCollectionPipe(
        lazyCollectionMap<ListenableKeycomboItem, string>(({ name }) => name),
        lazyCollectionJoin('+'),
      )
      
