import type {
  Graph,
} from '../extracted'
import type { GeneratorTransform } from './generator'

export type GraphTransform<Id extends string, Metadata, Transformed> = (graph: Graph<Id, Metadata>) => Transformed

export type GraphGeneratorTransform<Id extends string, Metadata, Yielded> = GeneratorTransform<Graph<Id, Metadata>, Yielded>
