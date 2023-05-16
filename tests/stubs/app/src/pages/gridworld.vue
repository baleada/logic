<template>
  <div class="js-grid"></div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import * as directedAcyclic from '../../../../../src/pipes/directed-acyclic'
import { defineGraphEdges } from '../../../../../src/extracted/graph'

onMounted(() => {
  // https://adrianmejia.com/priority-queue-data-structure-and-heaps-time-complexity-javascript-implementation/
  function createPriorityQueue () {
    const heap = []
    
    function enqueue(value, priority) {
      const node = { value, priority }
      heap.push(node)
      this.bubbleUp(heap.length - 1)
    }
    
    function dequeue() {
      const min = heap[0]
      const end = heap.pop()
      if (heap.length > 0) {
        heap[0] = end
        this.bubbleDown(0)
      }
      return min.value;
    }
    
    function bubbleUp(index) {
      const node = heap[index];
      while (index > 0) {
        const parentIndex = Math.floor((index - 1) / 2);
        const parent = heap[parentIndex]
        if (node.priority >= parent.priority) break
        heap[parentIndex] = node
        heap[index] = parent
        index = parentIndex
      }
    }
    
    function bubbleDown(index) {
      const length = heap.length
      const node = heap[index]
      while (true) {
        const leftChildIndex = 2 * index + 1
        const rightChildIndex = 2 * index + 2
        let leftChild, rightChild
        let swap = null
        if (leftChildIndex < length) {
          leftChild = heap[leftChildIndex]
          if (leftChild.priority < node.priority) swap = leftChildIndex
        }
        if (rightChildIndex < length) {
          rightChild = heap[rightChildIndex]
          if ((swap === null && rightChild.priority < node.priority) || (swap !== null && rightChild.priority < leftChild.priority)) {
            swap = rightChildIndex
          }
        }
        if (swap === null) break
        heap[index] = heap[swap]
        heap[swap] = node
        index = swap
      }
    }
    
    function size() {
      return heap.length
    }
    
    function isEmpty() {
      return !heap.length
    }

    return {
      enqueue,
      dequeue,
      bubbleUp,
      bubbleDown,
      size,
      isEmpty
    }
  }

  // Initial methods for tesla challenge
  const buildGraph = (rows, columns) => {
    const graph = []
    for (let i = 0; i < rows; i++) {
      const row = []
      for(let j = 0; j < columns; j++) {
        row.push(j)
      }
      graph.push(row)
    }
    return graph
  }

  const findEdges = (graph: number[][]) => {
    const nodes: `${number},${number}`[] = []
    const edges = defineGraphEdges<typeof nodes[0], number>([])

    for (let i = 0; i < graph.length; i++) {
      for (let j = 0; j < graph[i].length; j++) {
        const node = `${i},${j}` as const
        nodes.push(node)

        let totalEdges = 0
        
        if (i > 0) {
          const to = `${(i - 1)},${j}` as const

          if (!edges.find(edge => edge.to === node && edge.from === to)) {
            edges.push({ from: node, to, predicateTraversable: state => state[node].metadata === totalEdges })
            totalEdges++
          }
        }

        if (j > 0) {
          const to = `${i},${(j - 1)}` as const

          if (!edges.find(edge => edge.to === node && edge.from === to)) {
            edges.push({ from: node, to, predicateTraversable: state => state[node].metadata === totalEdges })
            totalEdges++
          }
        }

        if (i < graph.length - 1) {
          const to = `${(i + 1)},${j}` as const

          if (!edges.find(edge => edge.to === node && edge.from === to)) {
            edges.push({ from: node, to, predicateTraversable: state => state[node].metadata === totalEdges })
            totalEdges++
          }
        }

        if (j < graph[i].length - 1) {
          const to = `${i},${(j + 1)}` as const

          if (!edges.find(edge => edge.to === node && edge.from === to)) {
            edges.push({ from: node, to, predicateTraversable: state => state[node].metadata === totalEdges })
            totalEdges++
          }
        }
      }
    }

    return edges
  }

  const pipe = (fn, g) => (...args) => g(fn(...args))

  // A* algorith https://www.simplilearn.com/tutorials/artificial-intelligence-tutorial/a-star-algorithm#:~:text=DevelopmentExplore%20Program-,What%20is%20an%20A*%20Algorithm%3F,shortest%20path%20to%20be%20taken.
  const findRoute = (start, goal, edges, heuristic) => {
    if (disabledPaths.includes(start) || disabledPaths.includes(goal)) return
    const explored = new Set()
    
    const queue = createPriorityQueue()
    queue.enqueue(start, 0)
    
    const costs = {}
    costs[start] = 0
  
    const paths = {}
    paths[start] = [start]
    
    // Keep searching until the queue is empty
    while (!queue.isEmpty()) {
      const current = queue.dequeue()

      if (current === goal) return paths[current]

      explored.add(current)
    
      for (const [direction, neighbor] of Object.entries(edges[current])) {
        if (explored.has(neighbor)) continue  
    
        const cost = costs[current] + 1
    
        if (!costs.hasOwnProperty(neighbor) || cost < costs[neighbor]) {
          costs[neighbor] = cost
          const priority = cost + heuristic(neighbor, goal)
          queue.enqueue(neighbor, priority)
          paths[neighbor] = [...paths[current], neighbor]
        }
      }
    }
    
    return null;
  }

  const heuristic = (from, to) => {
    const [x1, y1] = from.split(',').map(Number)
    const [x2, y2] = to.split(',').map(Number)
    return Math.abs(x1 - x2) + Math.abs(y1 - y2)
  };

  const disablePaths = (edges, keys) => {
    Object.entries(edges).forEach(([key, value]) => {
      Object.entries(value).forEach(([subKey, subValue]) => {
        if (keys.includes(subValue)) delete edges[key][subKey]
      })
    })
  }

  const findCords = (v, c) => {
    const r = [...layout.children]
    const cords = v.split(',')
    const y = r.at(cords.at(0)).children[0]
    const x = [...y.children].at(cords.at(1))
    x.classList.add(c)
    return x
  }

  // Generate path to destination
  function * generatePath (collection) {
    let curr = 0;
    while(curr < collection.length - 1) {
      yield collection[curr++]
    };
    return collection.at(collection.length - 1)
  }

  const duration = 500
  const locationClass = 'location'
  const destinationClass = 'home'
  const render = (generator, path) => {
      const timer = setTimeout(() => {
        const { value, done } = generator.next()
        const prev = current
        prev.classList.remove(locationClass)
        current = findCords(value, locationClass)
        if (value === path.at(path.length - 1)) destination.classList.remove(destinationClass)
        if (!done) render(generator, path)
        clearTimeout(timer)
      }, duration)
    }
  // END

  const travel = (list) => {
    const path = findRoute(currentLocation, toLocation, edges, heuristic)
    const generator = generatePath(path)

    list.textContent = path.join('-')
    render(generator, path)
  }
  // END

  // Build data
  const graph = pipe(buildGraph, findEdges)

  let rows = 3
  let cols = 4
  const edges = graph(rows, cols)

  console.log(edges)

  let disabledPaths = ['1,2', '1,3']
  disablePaths(edges, disabledPaths) // Disable blocks
  // END

  // Build HMTL
  const layout = document.querySelector('.js-grid')
  const fragment = document.createDocumentFragment()

  const gridRows = [...Array(rows).keys()]
  const gridCols = [...Array(cols).keys()]
  gridRows.forEach(i => {
    const row = document.createElement('li')
    const cols = document.createElement('ul')
    gridCols.forEach(j => {
      const col = document.createElement('li')
      cols.append(col)
    })
    row.append(cols)
    fragment.append(row)
  })

  layout.append(fragment)
  // END

  // Add styling to grid
  let currentLocation = '2,3'
  let toLocation = '0,0'
  const disabledClass = 'disabled'
  disabledPaths.forEach(cords => findCords(cords, disabledClass))
  let current = findCords(currentLocation, locationClass)
  const destination = findCords(toLocation, destinationClass)
  // END

  // 
  const initiateEvent = document.querySelector('.js-button')
  const displayList = document.querySelector('.js-path')
  initiateEvent.addEventListener('click', () => travel(displayList))
})
</script>
