export function createToGraph (toChildren: (vertex: any) => any[]) {
  return root => {
    const nodes = ['0'],
          nodeMeta = { ['0']: root },
          edges = []
  
    function traverse(vertex: any, parent: string) {
      const children = toChildren(vertex) || []

      for (const child of children) {
        const id = `${nodes.length}`
        
        nodes.push(id)
        nodeMeta[id] = child
        edges.push({ from: parent, to: id })

        traverse(child, id)
      }
    }
  
    traverse(root, '0')
  
    return { nodes, edges }
  }
}
