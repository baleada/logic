export { defineAssociativeArrayEntries } from '../extracted'
export type { AssociativeArrayEntries } from '../extracted'

export { createAssociativeArray } from './createAssociativeArray'
export type { AssociativeArray, AssociativeArrayOptions } from './createAssociativeArray'

// RECOGNIZEABLE EFFECTS
export { createKeypress } from './createKeypress'
export type {
  KeypressType,
  KeypressMetadata,
  KeypressOptions,
  KeypressHook,
  KeypressHookApi,
} from './createKeypress'

export { createKeyrelease } from './createKeyrelease'
export type {
  KeyreleaseType,
  KeyreleaseMetadata,
  KeyreleaseOptions,
  KeyreleaseHook,
  KeyreleaseHookApi,
} from './createKeyrelease'
