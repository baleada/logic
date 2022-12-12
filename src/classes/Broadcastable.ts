import type { Listenable, ListenEffect } from "./Listenable"

export type BroadcastableOptions = {
  name?: string
}

export type BroadcastableStatus = 'ready' | 'broadcasting' | 'broadcasted' | 'stopped'

const defaultOptions: BroadcastableOptions = {
  name: 'baleada',
}

export class Broadcastable<State> {
  private name: string
  constructor (state: State, options: BroadcastableOptions = {}) {
    this.setState(state)
    this.name = options.name ?? defaultOptions.name
    this.ready()
  }
  private computedChannel: BroadcastChannel
  private computedStatus: BroadcastableStatus
  private ready () {
    this.computedStatus = 'ready'
  }

  get state () {
    return this.computedState
  }
  set state (state) {
    this.setState(state)
  }
  get status () {
    return this.computedStatus
  }
  get channel () {
    return this.computedChannel || (this.computedChannel = new BroadcastChannel(this.name))
  }

  private computedState: State
  setState (state: State) {
    this.computedState = state
    return this
  }

  broadcast () {
    this.broadcasting()
    this.channel.postMessage(this.state)
    this.broadcasted()
    return this
  }
  private broadcasting () {
    this.computedStatus = 'broadcasting'
  }
  private broadcasted () {
    this.computedStatus = 'broadcasted'
  }
  
  stop () {
    this.channel.close()
    this.stopped()
    return this
  }
  private stopped () {
    this.computedStatus = 'stopped'
  }
}

export function toMessageListenParams<State> (
  instance: Broadcastable<State>,
  effect: (event: MessageEvent<State>, api: Parameters<ListenEffect<'message'>>[1]) => void
): Parameters<Listenable<'message'>['listen']> {
    return [
      effect,
      { target: instance.channel }
    ]
}
