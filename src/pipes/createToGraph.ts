export function createToGraph (toChildren: (node: any) => any[]) {
  return root => {
    const nodes = ['0'],
          nodeMeta = { ['0']: root },
          edges = []
  
    function step (node: any, parent: string) {
      const children = toChildren(node) || []

      for (const child of children) {
        const id = `${nodes.length}`
        
        nodes.push(id)
        nodeMeta[id] = child
        edges.push({ from: parent, to: id })

        step(child, id)
      }
    }
  
    step(root, '0')
  
    return { nodes, edges }
  }
}
