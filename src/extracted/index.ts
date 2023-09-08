export type { DeepRequired } from './types'

// RECOGNIZEABLE EFFECTS
// Pipes
export { createKeycomboDown } from './createKeycomboDown'
export type { CreateKeycomboDownOptions } from './createKeycomboDown'

export { createKeycomboMatch } from './createKeycomboMatch'
export type { CreateKeycomboMatchOptions } from './createKeycomboMatch'

// Factories
export {
  createValue as createKeyStatusesValue,
  createSet as createKeyStatusesSet,
  createClear as createKeyStatusesClear,
  createDelete as createKeyStatusesDelete,
  createCode as createKeyStatusCode,
  predicateSomeKeyDown,
} from './key-statuses'
export type { KeyStatuses, KeyStatusCode, KeyStatus } from './key-statuses'

export { createKeyState } from './createKeyState'

// Transforms
export { fromComboToAliases } from './fromComboToAliases'

export { fromComboToAliasesLength } from './fromComboToAliasesLength'

export { fromEventToAliases } from './fromEventToAliases'

export { fromEventToKeyStatusCode, modifiers } from './fromEventToKeyStatusCode'

export { fromAliasToDownCodes } from './fromAliasToDownCodes'

export { toDirection } from './toDirection'
export type { Direction } from './toDirection'

export { toHookApi } from './toHookApi'
export type { HookApi } from './toHookApi'

export { toMousePoint, toTouchMovePoint, toTouchEndPoint } from './toPoints'

export { toPolarCoordinates } from './toPolarCoordinates'
export type { PolarCoordinates } from './toPolarCoordinates'

// Store
export { storeKeyboardTimeMetadata } from './storeKeyboardTimeMetadata'
export type { KeyboardTimeMetadata } from './storeKeyboardTimeMetadata'

export { storePointerStartMetadata } from './storePointerStartMetadata'
export type { PointerStartMetadata } from './storePointerStartMetadata'

export { storePointerMoveMetadata } from './storePointerMoveMetadata'
export type { PointerMoveMetadata } from './storePointerMoveMetadata'

export { storePointerTimeMetadata } from './storePointerTimeMetadata'
export type { PointerTimeMetadata } from './storePointerTimeMetadata'


// OBJECTS
export {
  defineGraph,
  defineGraphNodes,
  defineGraphEdges,
  defineGraphNode,
  defineGraphEdge,
  defineGraphAsync,
  defineGraphAsyncEdges,
  defineGraphAsyncEdge,
} from './graph'
export type {
  Graph,
  GraphNode as GraphNode,
  GraphEdge,
  GraphAsync,
  GraphAsyncEdge,
  GraphState,
  GraphPath,
  GraphStep,
  GraphCommonAncestor,
  GraphTreeNode,
  GraphTree,
} from './graph'

export { defineAssociativeArray } from './associative-array'
export type { AssociativeArray } from './associative-array'


// MULTIPLE CONCERNS
export { createExceptAndOnlyEffect } from './createExceptAndOnlyEffect'

export { getDomAvailability } from './getDomAvailability'

export {
  predicateArray,
  predicateUndefined,
  predicateFunction,
  predicateNull,
  predicateNumber,
  predicateString,
  predicateObject,
} from './predicates'

export { toLength } from './lazy-collections'

export { toInterpolated } from './toInterpolated'
