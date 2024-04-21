import type { GraphNode, GraphEdge } from '../extracted'
import type { GeneratorTransform } from './generator'

export type ToGraphYielded = {
  node: GraphNode<string>,
  edge: PartialGraphEdge | undefined
}

type PartialGraphEdge = Omit<GraphEdge<string, unknown>, 'predicateShouldTraverse'>

export type CreateGraphOptions<TreeNode> = {
  toId?: (node: TreeNode) => string,
  toChildren?: (node: TreeNode) => TreeNode[],
}

let totalGraphNodes = -1

const defaultOptions: Required<CreateGraphOptions<any>> = {
  toId: () => `${totalGraphNodes++}`,
  toChildren: node => node.children,
}

/**
 * [Docs](https://baleada.dev/docs/logic/pipes/graph)
 */
export function createGraph<TreeNode> (
  options: CreateGraphOptions<TreeNode> = {}
): GeneratorTransform<TreeNode[], ToGraphYielded> {
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
