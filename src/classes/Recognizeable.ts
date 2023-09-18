import { predicateArray } from '../extracted'
import type {
  ListenableSupportedType,
  ListenEffectParam,
  ListenOptions,
} from './Listenable'

export type RecognizeableOptions<Type extends ListenableSupportedType, Metadata extends Record<any, any>> = {
  maxSequenceLength?: true | number,
  effects?: { [type in Type]?: RecognizeableEffect<type, Metadata> }
}

export type RecognizeableEffect<Type extends ListenableSupportedType, Metadata extends Record<any, any>> = (
  sequenceItem: ListenEffectParam<Type>,
  api: RecognizeableEffectApi<Type, Metadata>,
) => void
    
export type RecognizeableEffectApi<Type extends ListenableSupportedType, Metadata extends Record<any, any>> = {
  getStatus: () => RecognizeableStatus,
  getMetadata: () => Metadata,
  setMetadata: (metadata: Metadata) => void,
  recognized: () => void,
  denied: () => void,
  getSequence: () => ListenEffectParam<Type>[],
  pushSequence: (sequenceItem: ListenEffectParam<Type>) => void,
  listenInjection: RecognizeOptions<Type>['listenInjection'],
}
    
export type RecognizeableStatus = 'recognized'
  | 'recognizing'
  | 'denied'
  | 'ready'

export type RecognizeOptions<Type extends ListenableSupportedType> = {
  listenInjection?: {
    effect: (sequenceItem: ListenEffectParam<Type>) => any,
    optionsByType: Record<Type, ListenOptions<Type>>,
  }
}

/**
 * [Docs](https://baleada.dev/docs/logic/classes/recognizeable)
 */
export class Recognizeable<Type extends ListenableSupportedType, Metadata extends Record<any, any>> {
  private maxSequenceLength: number | true
  private effects: RecognizeableOptions<Type, Metadata>['effects']
  private effectApi: RecognizeableEffectApi<Type, Metadata>
  constructor (sequence: ListenEffectParam<Type>[], options: RecognizeableOptions<Type, Metadata> = {}) {
    const defaultOptions: RecognizeableOptions<Type, Metadata> = {
      maxSequenceLength: true as const,
      effects: {},
    }
    
    this.maxSequenceLength = options?.maxSequenceLength || defaultOptions.maxSequenceLength // 0 and false are not allowed
    this.effects = options?.effects || defaultOptions.effects

    this.resetComputedMetadata()

    this.setSequence(sequence)

    // The full effect API isn't available until runtime.
    // This object is asserted as the full API. Full API access is verified by tests.
    this.effectApi = {
      getStatus: () => this.status,
      getMetadata: () => this.metadata,
      setMetadata: (metadata: Metadata) => this.computedMetadata = metadata,
      recognized: () => this.recognized(),
      denied: () => this.denied(),
      ready: () => this.ready(),
    } as unknown as RecognizeableEffectApi<Type, Metadata>

    this.ready()
  }

  private computedMetadata: Metadata
  private resetComputedMetadata () {
    this.computedMetadata = {} as Metadata
  }
  
  private recognized () {
    this.computedStatus = 'recognized'
  }
  private denied () {
    this.computedStatus = 'denied'
  }
  private computedStatus: RecognizeableStatus
  private ready () {
    this.computedStatus = 'ready'
  }

  get sequence () {
    return this.computedSequence
  }
  set sequence (sequence) {
    this.setSequence(sequence)
  }
  get status () {
    return this.computedStatus
  }
  get metadata () {
    return this.computedMetadata
  }

  private computedSequence: ListenEffectParam<Type>[]
  setSequence (sequence: ListenEffectParam<Type>[]) {
    this.computedSequence = sequence
    return this
  }

  recognize (sequenceItem: ListenEffectParam<Type>, options: RecognizeOptions<Type> = {}) {
    this.recognizing()

    const type = this.toType(sequenceItem),
          pushSequence = (sequenceItem: ListenEffectParam<Type>) => {
            newSequence.push(sequenceItem)
            if (
              this.maxSequenceLength !== true
              && newSequence.length > this.maxSequenceLength
            ) {
              newSequence.shift()
            }
          },
          newSequence: ListenEffectParam<Type>[] = []

    for (const sequenceItem of this.sequence) {
      pushSequence(sequenceItem)
    }

    pushSequence(sequenceItem)
          
    this.effectApi.getSequence = () => newSequence
    this.effectApi.pushSequence = pushSequence
    this.effectApi.listenInjection = {
      effect: options.listenInjection?.effect || (() => {}) as unknown as RecognizeOptions<Type>['listenInjection']['effect'],
      optionsByType: options.listenInjection?.optionsByType || {} as unknown as RecognizeOptions<Type>['listenInjection']['optionsByType'],
    }

    this.effects[type]?.(sequenceItem, { ...this.effectApi })
      
    switch (this.status) {
      case 'ready':
      case 'denied':
        this.resetComputedMetadata()
        this.setSequence([])
        break
      case 'recognizing':
      case 'recognized':
        this.setSequence(newSequence)
        break
    }

    return this
  }
  private recognizing () {
    this.computedStatus = 'recognizing'
  }
  private toType (sequenceItem: ListenEffectParam<Type>) {
    if (predicateArray(sequenceItem)) {
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

      return (sequenceItem as Event).type
    }
  }
}
