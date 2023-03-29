import type { RecognizeableEffect, RecognizeableStatus, ListenableSupportedType, ListenEffectParam } from '../classes'

export type HookApi<Type extends ListenableSupportedType, Metadata extends Record<any, any>> = {
  status: RecognizeableStatus,
  metadata: Metadata,
  sequence: ListenEffectParam<Type>[]
}

export function toHookApi<
  Type extends ListenableSupportedType,
  Metadata extends Record<any, any>
> ({
  getSequence,
  getStatus,
  getMetadata,
}: Parameters<RecognizeableEffect<Type, Metadata>>[1]): HookApi<Type, Metadata> {
  return {
    sequence: getSequence(),
    status: getStatus(),
    metadata: getMetadata(),
  }
}
