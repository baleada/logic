import type { GraphState } from '../extracted'

export type GraphAsyncStateTransform<Id extends string, Metadata, Transformed> = (state: GraphState<Id, Metadata>) => Promise<Transformed>
