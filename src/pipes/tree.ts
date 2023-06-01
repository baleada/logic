import type {
  GraphNode,
  GraphTreeNode,
} from '../extracted'

export type GraphTreeFn<Id extends string, Returned> = (tree: GraphTreeNode<Id>[]) => Returned

export function createFind<Id extends string> (node: GraphNode<Id>): GraphTreeFn<Id, GraphTreeNode<Id>> {
  return tree => {
    for (const treeNode of tree) {
      if (treeNode.node === node) return treeNode

      const found = createFind(node)(treeNode.children)
      if (found) return found
    }
  }
}
