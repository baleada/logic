import type {
  GraphNode,
  GraphTreeNode,
} from '../extracted'

export type GraphTreeTransform<Id extends string, Transformed> = (tree: GraphTreeNode<Id>[]) => Transformed

export function createFind<Id extends string> (node: GraphNode<Id>): GraphTreeTransform<Id, GraphTreeNode<Id>> {
  return tree => {
    for (const treeNode of tree) {
      if (treeNode.node === node) return treeNode

      const found = createFind(node)(treeNode.children)
      if (found) return found
    }
  }
}
