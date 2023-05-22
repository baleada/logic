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

export { createMousepress } from './createMousepress'
export type {
  MousepressTypes,
  MousepressMetadata,
  MousepressOptions,
  MousepressHook,
  MousepressHookApi,
} from './createMousepress'

export { createMouserelease } from './createMouserelease'
export type {
  MousereleaseTypes,
  MousereleaseMetadata,
  MousereleaseOptions,
  MousereleaseHook,
  MousereleaseHookApi,
} from './createMouserelease'

export { createTouchpress } from './createTouchpress'
export type {
  TouchpressTypes,
  TouchpressMetadata,
  TouchpressOptions,
  TouchpressHook,
  TouchpressHookApi,
} from './createTouchpress'

export { createTouchrelease } from './createTouchrelease'
export type {
  TouchreleaseTypes,
  TouchreleaseMetadata,
  TouchreleaseOptions,
  TouchreleaseHook,
  TouchreleaseHookApi,
} from './createTouchrelease'
