import {
  isArray,
  isNumber,
  isFunction
} from '../extracted'
import { createSlice, createConcat } from '../pipes'
import {
  ListenableSupportedType,
  ListenEffectParam,
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
  onRecognized: (sequenceItem: ListenEffectParam<Type>) => any,
}
    
export type RecognizeableStatus = 'recognized' | 'recognizing' | 'denied' | 'ready'

export type RecognizeOptions<Type extends ListenableSupportedType, Metadata extends Record<any, any>> = {
  onRecognized?: (sequenceItem: ListenEffectParam<Type>) => any,
}

export class Recognizeable<Type extends ListenableSupportedType, Metadata extends Record<any, any>> {
  private maxSequenceLength: number | true
  private effects: Map<string, RecognizeableEffect<Type, Metadata>>
  private effectApi: RecognizeableEffectApi<Type, Metadata>
  constructor (sequence: ListenEffectParam<Type>[], options: RecognizeableOptions<Type, Metadata> = {}) {
    const defaultOptions: RecognizeableOptions<Type, Metadata> = {
      maxSequenceLength: true as const,
      effects: {},
    }
    
    this.maxSequenceLength = options?.maxSequenceLength || defaultOptions.maxSequenceLength // 0 and false are not allowed
    this.effects = new Map(Object.entries(options?.effects || defaultOptions.effects))

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

  recognize (sequenceItem: ListenEffectParam<Type>, { onRecognized }: RecognizeOptions<Type, Metadata> = {}) {
    this.recognizing()

    const type = this.toType(sequenceItem),
          excess = isNumber(this.maxSequenceLength)
            ? Math.max(0, this.sequence.length - this.maxSequenceLength)
            : 0,
          newSequence = createConcat(
            createSlice<ListenEffectParam<Type>>(excess)(this.sequence),
            [sequenceItem]
          )([])
          
    this.effectApi.getSequence = () => newSequence
    this.effectApi.onRecognized = onRecognized || (() => {})

    this.effects.get(type)?.(sequenceItem, { ...this.effectApi })
      
    switch (this.status) {
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

      return (sequenceItem as Event).type
    }
  }
}
