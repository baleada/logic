import type { Listenable, ListenEffect } from './Listenable'

export type BroadcastableOptions = {
  name?: string
}

export type BroadcastableStatus = 'ready' | 'broadcasting' | 'broadcasted' | 'errored' | 'stopped'

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
  private computedChannel: BroadcastChannel
  get channel () {
    return this.computedChannel || (this.computedChannel = new BroadcastChannel(this.name))
  }
  private computedError: Error
  get error () {
    return this.computedError
  }

  private computedState: State
  setState (state: State) {
    this.computedState = state
    return this
  }

  broadcast () {
    this.broadcasting()

    try {
      this.channel.postMessage(this.state)
      this.broadcasted()
    } catch (error) {
      this.computedError = error
      this.errored()
    }

    return this
  }
  private broadcasting () {
    this.computedStatus = 'broadcasting'
  }
  private broadcasted () {
    this.computedStatus = 'broadcasted'
  }
  private errored () {
    this.computedStatus = 'errored'
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
  effect: (event: MessageEvent<State>) => void
): Parameters<Listenable<'message'>['listen']> {
    return [
      effect,
      { target: instance.channel }
    ]
}
