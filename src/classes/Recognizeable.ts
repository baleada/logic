import {
  map as lazyCollectionMap,
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
import { createSlice, createConcat } from '../pipes'
import {
  ListenableSupportedEventType,
  eventMatchesClickcombo,
  toImplementation,
  eventMatchesKeycombo,
  ListenableSupportedType,
  ListenHandleParam,
  ListenHandle
} from './Listenable'

export type RecognizeableOptions<Type extends ListenableSupportedType, Metadata extends Record<any, any>> = {
  maxSequenceLength?: true | number,
  handlersIncludeCombos?: boolean,
  handlers?: { [type in Type]?: (api: RecognizeableHandlerApi<Type, Metadata>) => any }
    | [type: Type, handler: (api: RecognizeableHandlerApi<Type, Metadata>) => any][]
}

export type RecognizeableStatus = 'recognized' | 'recognizing' | 'denied' | 'ready'

export type RecognizeableHandlerApi<Type extends ListenableSupportedType, Metadata extends Record<any, any>> = HandlerApiFromConstructor<Type, Metadata> & HandlerApiFromRuntime<Type>

type HandlerApiFromConstructor<Type extends ListenableSupportedType, Metadata> = {
  getStatus: () => 'recognized' | 'recognizing' | 'denied' | 'ready',
  getMetadata: () => Metadata,
  setMetadata: (metadata: Metadata) => void,
  recognized: () => void,
  denied: () => void,
  effect: (sequenceItem: ListenHandleParam<Type>) => any,
}

type HandlerApiFromRuntime<Type extends ListenableSupportedType> = {
  sequenceItem: ListenHandleParam<Type>,
  getSequence: () => ListenHandleParam<Type>[]
}

export class Recognizeable<Type extends ListenableSupportedType, Metadata extends Record<any, any>> {
  _maxSequenceLength: number | true
  _handlers: Map<string, (api: RecognizeableHandlerApi<Type, Metadata>) => any>
  _handlerApi: HandlerApiFromConstructor<Type, Metadata>
  _toType: (sequenceItem: ListenHandleParam<Type>) => string

  constructor (sequence: ListenHandleParam<Type>[], options: RecognizeableOptions<Type, Metadata> = { handlersIncludeCombos: true }) {
    const defaultOptions: RecognizeableOptions<Type, Metadata> = {
      maxSequenceLength: true as const,
      handlersIncludeCombos: true,
      handlers: {},
    }
    
    this._maxSequenceLength = options?.maxSequenceLength || defaultOptions.maxSequenceLength // 0 and false are not allowed
    this._handlers = new Map(
      isArray(options?.handlers) 
        ? options.handlers
        : Object.entries(options?.handlers || defaultOptions.handlers)
    )

    this._toType = createToType({
      handlersIncludeCombos: options.handlersIncludeCombos,
      handlers: this._handlers,
    })

    this._resetComputedMetadata()

    this.setSequence(sequence)

    this._handlerApi = {
      getStatus: () => this.status,
      getMetadata: () => this.metadata,
      setMetadata: (metadata: Metadata) => this._computedMetadata = metadata,
      recognized: () => this._recognized(),
      denied: () => this._denied(),
      effect: (sequenceItem: ListenHandleParam<Type>) => this.effect?.(sequenceItem),
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

  _computedSequence: ListenHandleParam<Type>[]
  setSequence (sequence: ListenHandleParam<Type>[]) {
    this._computedSequence = sequence
    return this
  }
  _computedEffect: ((sequenceItem: ListenHandleParam<Type>) => any)
  setEffect (effect: ((sequenceItem: ListenHandleParam<Type>) => any)) {
    this._computedEffect = effect
    return this
  }

  recognize (sequenceItem: ListenHandleParam<Type>) {
    this._recognizing()

    const type = this._toType(sequenceItem),
          excess = isNumber(this._maxSequenceLength)
            ? Math.max(0, this.sequence.length - this._maxSequenceLength)
            : 0,
          newSequence = createConcat(
            createSlice<ListenHandleParam<Type>>({ from: excess })(this.sequence),
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

export function defineRecognizeableHandler<Type extends ListenableSupportedType, Metadata extends Record<any, any>, HandlerType extends Type> (type: HandlerType, handler: (api: RecognizeableHandlerApi<HandlerType, Metadata>)  => any): [Type, (api: RecognizeableHandlerApi<HandlerType, Metadata>) => any]  {
  return [type, handler]
}

function createToType<Type extends ListenableSupportedType, Metadata> ({
  handlersIncludeCombos,
  handlers
}: {
 handlersIncludeCombos?: RecognizeableOptions<Type, Metadata>['handlersIncludeCombos'],
 handlers?: Map<string, (api: RecognizeableHandlerApi<Type, Metadata>) => any>
}): (sequence: ListenHandleParam<Type>) => string {
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

  return function toType (sequenceItem: ListenHandleParam<Type>) {
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

const leftclickcomboEventTypes = new Set(['click', 'mousedown', 'mouseup', 'dblclick']),
      rightclickComboEventTypes = new Set(['contextmenu']),
      keycomboEventTypes = new Set(['keydown', 'keyup']),
      toJoinedClickcombo = lazyCollectionJoin('+'),
      toJoinedKeycombo = lazyCollectionPipe(
        lazyCollectionMap<ListenableKeycomboItem, string>(({ name }) => name),
        lazyCollectionJoin('+'),
      )
