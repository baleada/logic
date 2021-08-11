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
  ListenEffectParam,
} from './Listenable'

export type RecognizeableOptions<Type extends ListenableSupportedType, Metadata extends Record<any, any>> = {
  maxSequenceLength?: true | number,
  effectsIncludeCombos?: boolean,
  effects?: { [type in Type]?: (api: RecognizeableEffectApi<Type, Metadata>) => any }
    | ((defineEffect: DefineEffect<Type, Metadata>) => [type: Type, effect: (api: RecognizeableEffectApi<Type, Metadata>) => any][])
}

type DefineEffect<Type extends ListenableSupportedType, Metadata extends Record<any, any>> = 
  <EffectType extends Type>(type: EffectType, effect: (api: RecognizeableEffectApi<EffectType, Metadata>) => any) 
    => [type: Type, effect: (api: RecognizeableEffectApi<Type, Metadata>) => any]

export type RecognizeableStatus = 'recognized' | 'recognizing' | 'denied' | 'ready'

export type RecognizeableEffectApi<Type extends ListenableSupportedType, Metadata extends Record<any, any>> = {
  getStatus: () => 'recognized' | 'recognizing' | 'denied' | 'ready',
  getMetadata: () => Metadata,
  setMetadata: (metadata: Metadata) => void,
  recognized: () => void,
  denied: () => void,
  sequenceItem: ListenEffectParam<Type>,
  getSequence: () => ListenEffectParam<Type>[],
  onRecognized: (sequenceItem: ListenEffectParam<Type>) => any,
}

export type RecognizeOptions<Type extends ListenableSupportedType, Metadata extends Record<any, any>> = {
  onRecognized?: (sequenceItem: ListenEffectParam<Type>) => any,
}

export class Recognizeable<Type extends ListenableSupportedType, Metadata extends Record<any, any>> {
  _maxSequenceLength: number | true
  _effects: Map<string, (api: RecognizeableEffectApi<Type, Metadata>) => any>
  _effectApi: RecognizeableEffectApi<Type, Metadata>
  _toType: (sequenceItem: ListenEffectParam<Type>) => string

  constructor (sequence: ListenEffectParam<Type>[], options: RecognizeableOptions<Type, Metadata> = { effectsIncludeCombos: true }) {
    const defaultOptions: RecognizeableOptions<Type, Metadata> = {
      maxSequenceLength: true as const,
      effectsIncludeCombos: true,
      effects: {},
    }
    
    this._maxSequenceLength = options?.maxSequenceLength || defaultOptions.maxSequenceLength // 0 and false are not allowed
    this._effects = new Map(
      isFunction(options?.effects) 
        ? options.effects(createDefineEffect<Type, Metadata>())
        : Object.entries(options?.effects || defaultOptions.effects)
    )

    this._toType = createToType({
      effectsIncludeCombos: options.effectsIncludeCombos,
      effects: this._effects,
    })

    this._resetComputedMetadata()

    this.setSequence(sequence)

    // The full effect API isn't available until runtime.
    // This object is asserted as the full API. Full API access is verified by tests.
    // 
    this._effectApi = {
      getStatus: () => this.status,
      getMetadata: () => this.metadata,
      setMetadata: (metadata: Metadata) => this._computedMetadata = metadata,
      recognized: () => this._recognized(),
      denied: () => this._denied(),
    } as unknown as RecognizeableEffectApi<Type, Metadata>

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
  get status () {
    return this._computedStatus
  }
  get metadata () {
    return this._computedMetadata
  }

  _computedSequence: ListenEffectParam<Type>[]
  setSequence (sequence: ListenEffectParam<Type>[]) {
    this._computedSequence = sequence
    return this
  }

  recognize (sequenceItem: ListenEffectParam<Type>, { onRecognized }: RecognizeOptions<Type, Metadata> = {}) {
    this._recognizing()

    const type = this._toType(sequenceItem),
          excess = isNumber(this._maxSequenceLength)
            ? Math.max(0, this.sequence.length - this._maxSequenceLength)
            : 0,
          newSequence = createConcat(
            createSlice<ListenEffectParam<Type>>({ from: excess })(this.sequence),
            [sequenceItem]
          )([])
    
    this._effectApi.sequenceItem = sequenceItem
    this._effectApi.getSequence = () => newSequence
    this._effectApi.onRecognized = onRecognized || (() => {})
    
    this._effects.get(type)?.(this._effectApi)
      
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

export function createDefineEffect<Type extends ListenableSupportedType, Metadata extends Record<any, any>> (): DefineEffect<Type, Metadata> {
  return <EffectType extends Type>(type: EffectType, effect: (api: RecognizeableEffectApi<EffectType, Metadata>) => any) => {
    return [type, effect]
  }
}

function createToType<Type extends ListenableSupportedType, Metadata> ({
  effectsIncludeCombos,
  effects
}: {
 effectsIncludeCombos?: RecognizeableOptions<Type, Metadata>['effectsIncludeCombos'],
 effects?: Map<string, (api: RecognizeableEffectApi<Type, Metadata>) => any>
}): (sequence: ListenEffectParam<Type>) => string {
  const effectLeftclickcombos: ListenableClickcomboItem[][] = [],
        effectRightclickcombos: ListenableClickcomboItem[][] = [],
        effectKeycombos: ListenableKeycomboItem[][] = []

  if (effectsIncludeCombos) {
    for (const [effectKey] of effects) {
      const implementation = toImplementation(effectKey)

      switch (implementation) {
        case 'leftclickcombo':
          effectLeftclickcombos.push(ensureClickcombo(effectKey))
          break
        case 'rightclickcombo':
          effectRightclickcombos.push(ensureClickcombo(effectKey))
          break
        case 'keycombo':
          effectKeycombos.push(ensureKeycombo(effectKey))
          break
        default:
          // do nothing
          break
      }
    }
  }

  return function toType (sequenceItem: ListenEffectParam<Type>) {
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

      if (effectLeftclickcombos?.length > 0) {
        if (leftclickcomboEventTypes.has((sequenceItem as Event).type)) {
          for (const clickcombo of effectLeftclickcombos) {
            if (eventMatchesClickcombo({ event: sequenceItem as MouseEvent, clickcombo })) {
              return toJoinedClickcombo(clickcombo) as string
            }
          }
        }
      }
      
      if (effectRightclickcombos?.length > 0) {
        if (rightclickComboEventTypes.has((sequenceItem as Event).type)) {
          for (const clickcombo of effectRightclickcombos) {
            if (eventMatchesClickcombo({ event: sequenceItem as MouseEvent, clickcombo })) {
              return toJoinedClickcombo(clickcombo) as string
            }
          }
        }
      }
      
      if (effectKeycombos?.length > 0) {
        if (keycomboEventTypes.has((sequenceItem as Event).type)) {
          for (const keycombo of effectKeycombos) {
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
