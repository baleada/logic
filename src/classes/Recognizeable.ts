import {
  map as lazyCollectionMap,
  pipe as lazyCollectionPipe,
  join as lazyCollectionJoin,
} from 'lazy-collections'
import {
  isArray,
  isNumber,
  ensureClickcombo,
  ensureKeycombo,
  isFunction
} from '../extracted'
import type {
  ListenableKeycomboItem,
  ListenableClickcomboItem,
} from '../extracted'
import { createSlice, createConcat } from '../pipes'
import {
  eventMatchesClickcombo,
  toImplementation,
  eventMatchesKeycombo,
  ListenableSupportedType,
  ListenHandleParam,
} from './Listenable'

export type RecognizeableOptions<Type extends ListenableSupportedType, Metadata extends Record<any, any>> = {
  maxSequenceLength?: true | number,
  handlesIncludeCombos?: boolean,
  handles?: { [type in Type]?: (api: RecognizeableHandleApi<Type, Metadata>) => any }
    | ((defineHandle: DefineHandle<Type, Metadata>) => [type: Type, handle: (api: RecognizeableHandleApi<Type, Metadata>) => any][])
}

type DefineHandle<Type extends ListenableSupportedType, Metadata extends Record<any, any>> = 
  <HandleType extends Type>(type: HandleType, handle: (api: RecognizeableHandleApi<HandleType, Metadata>) => any) 
    => [type: Type, handle: (api: RecognizeableHandleApi<Type, Metadata>) => any]

export type RecognizeableStatus = 'recognized' | 'recognizing' | 'denied' | 'ready'

export type RecognizeableHandleApi<Type extends ListenableSupportedType, Metadata extends Record<any, any>> = HandleApiFromConstructor<Type, Metadata> & HandleApiFromRuntime<Type>

type HandleApiFromConstructor<Type extends ListenableSupportedType, Metadata> = {
  getStatus: () => 'recognized' | 'recognizing' | 'denied' | 'ready',
  getMetadata: () => Metadata,
  setMetadata: (metadata: Metadata) => void,
  recognized: () => void,
  denied: () => void,
  effect: (sequenceItem: ListenHandleParam<Type>) => any,
}

type HandleApiFromRuntime<Type extends ListenableSupportedType> = {
  sequenceItem: ListenHandleParam<Type>,
  getSequence: () => ListenHandleParam<Type>[]
}

export class Recognizeable<Type extends ListenableSupportedType, Metadata extends Record<any, any>> {
  _maxSequenceLength: number | true
  _handles: Map<string, (api: RecognizeableHandleApi<Type, Metadata>) => any>
  _handleApi: HandleApiFromConstructor<Type, Metadata>
  _toType: (sequenceItem: ListenHandleParam<Type>) => string

  constructor (sequence: ListenHandleParam<Type>[], options: RecognizeableOptions<Type, Metadata> = { handlesIncludeCombos: true }) {
    const defaultOptions: RecognizeableOptions<Type, Metadata> = {
      maxSequenceLength: true as const,
      handlesIncludeCombos: true,
      handles: {},
    }
    
    this._maxSequenceLength = options?.maxSequenceLength || defaultOptions.maxSequenceLength // 0 and false are not allowed
    this._handles = new Map(
      isFunction(options?.handles) 
        ? options.handles(createDefineHandle<Type, Metadata>())
        : Object.entries(options?.handles || defaultOptions.handles)
    )

    this._toType = createToType({
      handlesIncludeCombos: options.handlesIncludeCombos,
      handles: this._handles,
    })

    this._resetComputedMetadata()

    this.setSequence(sequence)

    this._handleApi = {
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
          
    this._handles.get(type)?.({
      sequenceItem: sequenceItem,
      ...this._handleApi,
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

export function createDefineHandle<Type extends ListenableSupportedType, Metadata extends Record<any, any>> (): DefineHandle<Type, Metadata> {
  return <HandleType extends Type>(type: HandleType, handle: (api: RecognizeableHandleApi<HandleType, Metadata>) => any) => {
    return [type, handle]
  }
}

function createToType<Type extends ListenableSupportedType, Metadata> ({
  handlesIncludeCombos,
  handles
}: {
 handlesIncludeCombos?: RecognizeableOptions<Type, Metadata>['handlesIncludeCombos'],
 handles?: Map<string, (api: RecognizeableHandleApi<Type, Metadata>) => any>
}): (sequence: ListenHandleParam<Type>) => string {
  const handleLeftclickcombos: ListenableClickcomboItem[][] = [],
        handleRightclickcombos: ListenableClickcomboItem[][] = [],
        handleKeycombos: ListenableKeycomboItem[][] = []

  if (handlesIncludeCombos) {
    for (const [handleKey] of handles) {
      const implementation = toImplementation(handleKey)

      switch (implementation) {
        case 'leftclickcombo':
          handleLeftclickcombos.push(ensureClickcombo(handleKey))
          break
        case 'rightclickcombo':
          handleRightclickcombos.push(ensureClickcombo(handleKey))
          break
        case 'keycombo':
          handleKeycombos.push(ensureKeycombo(handleKey))
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

      if (handleLeftclickcombos?.length > 0) {
        if (leftclickcomboEventTypes.has((sequenceItem as Event).type)) {
          for (const clickcombo of handleLeftclickcombos) {
            if (eventMatchesClickcombo({ event: sequenceItem as MouseEvent, clickcombo })) {
              return toJoinedClickcombo(clickcombo) as string
            }
          }
        }
      }
      
      if (handleRightclickcombos?.length > 0) {
        if (rightclickComboEventTypes.has((sequenceItem as Event).type)) {
          for (const clickcombo of handleRightclickcombos) {
            if (eventMatchesClickcombo({ event: sequenceItem as MouseEvent, clickcombo })) {
              return toJoinedClickcombo(clickcombo) as string
            }
          }
        }
      }
      
      if (handleKeycombos?.length > 0) {
        if (keycomboEventTypes.has((sequenceItem as Event).type)) {
          for (const keycombo of handleKeycombos) {
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
