import { Animateable } from './Animateable'
import type { AnimateFrameEffect } from './Animateable'

export type DelayableOptions = {
  delay?: number,
  executions?: number | true,
}

export type DelayableEffect = (timestamp: number) => any

export type DelayableStatus = 'ready' | 'delaying' | 'delayed' | 'paused' | 'sought' | 'stopped'

const defaultOptions = {
  delay: 0,
  executions: 1,
}

/**
 * [Docs](https://baleada.dev/docs/logic/classes/delayable)
 */
export class Delayable {
  private animateable: Animateable<number>
  constructor (effect: DelayableEffect, options: DelayableOptions = {}) {
    this.animateable = new Animateable(
      [
        { progress: 0, properties: { progress: 0 } },
        { progress: 1, properties: { progress: 1 } },
      ],
      {
        duration: options?.delay ?? defaultOptions.delay,
        iterations: options?.executions ?? defaultOptions.executions,
      }
    )

    this.setEffect(effect)
    this.ready()
  }
  private computedStatus: DelayableStatus
  private ready () {
    this.computedStatus = 'ready'
  }

  get effect () {
    return this.computedEffect
  }
  set effect (effect) {
    this.setEffect(effect)
  }
  get status () {
    return this.computedStatus
  }
  get executions () {
    return this.animateable.iterations
  }
  get time () {
    return this.animateable.time
  }
  get progress () {
    return this.animateable.progress.time
  }

  private computedEffect: DelayableEffect
  setEffect (effect: DelayableEffect) {
    this.stop()

    this.computedEffect = effect
    this.setFrameEffect(effect)

    return this
  }
  private frameEffect: AnimateFrameEffect
  private setFrameEffect (effect: DelayableEffect) {
    this.frameEffect = frame => {
      const { properties: { progress }, timestamp } = frame

      // Don't call delayable function until progress is 1
      if (progress.interpolated === 1) {
        effect(timestamp)
        this.delayed()
      } else {
        switch (this.status) {
        case 'ready':
        case 'paused':
        case 'sought':
        case 'delayed':
        case 'stopped':
          this.delaying()
          break
        }
      }
    }
  }
  private delaying () {
    this.computedStatus = 'delaying'
  }
  private delayed () {
    this.computedStatus = 'delayed'
  }

  delay () {
    switch (this.status) {
    case 'delaying':
      this.animateable.restart()
      break
    case 'sought':
      this.seek(0)
      this.animateable.play(frame => this.frameEffect(frame))
      break
    case 'ready':
    case 'paused':
    case 'delayed':
    case 'stopped':
      this.animateable.play(frame => this.frameEffect(frame))
    }

    return this
  }

  pause () {
    switch (this.status) {
    case 'delaying':
      this.animateable.pause()
      this.paused()
      break
    }
    
    return this
  }
  private paused () {
    this.computedStatus = 'paused'
  }

  resume () {
    switch (this.status) {
    case 'paused':
    case 'sought':
      this.animateable.play(frame => this.frameEffect(frame))
      break
    case 'ready':
    case 'delaying':
    case 'delayed':
    case 'stopped':
      // Do nothing
      break
    }

    return this
  }

  seek (timeProgress: number) {
    const executions = Math.floor(timeProgress)

    if (executions > 0) {
      window.requestAnimationFrame(timestamp => {
        for (let i = 0; i < executions; i++) {
          this.frameEffect({
            properties: {
              progress: {
                progress: { time: 1, animation: 1 },
                interpolated: 1,
              },
            },
            timestamp,
          })
        }
      })
    }

    this.animateable.seek(timeProgress, { effect: frame => this.frameEffect(frame) })
    this.sought()

    return this
  }
  private sought () {
    this.computedStatus = 'sought'
  }
  
  stop () {
    this.animateable.stop()
    this.stopped()

    return this
  }
  private stopped () {
    this.computedStatus = 'stopped'
  }
}
