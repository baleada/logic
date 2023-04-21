import type { GraphNode, GraphEdge } from '../extracted'
import type { GeneratorFn } from './types'

export type ToGraphYielded = {
  node: GraphNode<string>,
  edge: PartialGraphEdge | undefined
}

type PartialGraphEdge = Omit<GraphEdge<string, unknown>, 'predicateTraversable'>

export type CreateToGraphOptions<TreeNode> = {
  toId?: (node: TreeNode) => string,
  toChildren?: (node: TreeNode) => TreeNode[],
}

const defaultOptions: Required<CreateToGraphOptions<any>> = {
  toId: node => node.id,
  toChildren: node => node.children,
}

export function createToGraph<TreeNode> (options: CreateToGraphOptions<TreeNode> = {}): GeneratorFn<TreeNode[], ToGraphYielded> {
  const { toId, toChildren } = { ...defaultOptions, ...options }

  return function* (tree) {
    const root = tree[0],
          rootId = toId(root)
  
    function* toPair (node: TreeNode, id: string) {
      const children = toChildren(node) || []

      for (const child of children) {
        const childId = toId(child)

        yield {
          node: childId,
          edge: { from: id, to: childId },
        }

        yield* toPair(child, childId)
      }
    }
  
    yield { node: rootId }
    yield* toPair(root, rootId)
  }
}
