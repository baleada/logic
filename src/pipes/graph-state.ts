import type { GraphState } from '../extracted'

export type GraphStateTransform<Id extends string, Metadata, Transformed> = (state: GraphState<Id, Metadata>) => Transformed
