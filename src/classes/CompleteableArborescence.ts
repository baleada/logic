import { createDirectedAcyclicFns } from '../factories/graph-fns'
import type { Graph, DirectedAcyclicFns } from '../factories/graph-fns'

export type CompleteableOptions = Record<never, never>

export type CompleteableStatus = 'constructing' | 'ready' | 'completing' | 'completed'

export class Completeable {
  constructor (arborescence: Graph<string, number>, options: CompleteableOptions = {}) {
    this.constructing()
    this.setArborescence(arborescence)
    this.ready()
  }
  private computedStatus: CompleteableStatus
  private constructing () {
    this.computedStatus = 'constructing'
  }
  private ready () {
    this.computedStatus = 'ready'
  }

  get arborescence () {
    return this.computedArborescence
  }
  set arborescence (arborescence) {
    this.setArborescence(arborescence)
  }
  private computedFns: DirectedAcyclicFns<string, number>
  get fns () {
    return this.computedFns
  }
  get status () {
    return this.computedStatus
  }

  private computedArborescence: Graph<string, number>
  setArborescence (arborescence: Graph<string, number>) {
    this.computedArborescence = arborescence
    this.computedFns = createDirectedAcyclicFns(
      arborescence.nodes,
      arborescence.edges,
      () => 0,
      (node, totalConnectionsFollowed) => totalConnectionsFollowed,
    )
    return this
  }
}
