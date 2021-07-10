import { Animateable } from './Animateable'
import type { AnimateFrameHandler } from './Animateable'

export type DelayableOptions = {
  delay?: number,
  executions?: number | true,
}

export type DelayableFunction = (timestamp: number) => any

export type DelayableStatus = 'ready' | 'delaying' | 'delayed' | 'paused' | 'sought' | 'stopped'

const defaultOptions = {
  delay: 0,
  executions: 1,
}

export class Delayable {
  _animateable: Animateable
  constructor (fn: DelayableFunction, options: DelayableOptions = {}) {
    this._animateable = new Animateable(
      [
        { progress: 0, properties: { progress: 0 } },
        { progress: 1, properties: { progress: 1 } }
      ],
      {
        duration: options?.delay ?? defaultOptions.delay,
        iterations: options?.executions ?? defaultOptions.executions,
      }
    )

    this.setFn(fn)
    this._ready()
  }
  _computedStatus: DelayableStatus
  _ready () {
    this._computedStatus = 'ready'
  }

  get fn () {
    return this._computedFn
  }
  set fn (fn) {
    this.setFn(fn)
  }
  get status () {
    return this._computedStatus
  }
  get executions () {
    return this._animateable.iterations
  }
  get time () {
    return this._animateable.time
  }
  get progress () {
    return this._animateable.progress.time
  }

  _computedFn: DelayableFunction
  setFn (fn: DelayableFunction) {
    this.stop()

    this._computedFn = fn
    this._setFrameHandler(fn)

    return this
  }
  _frameHandler: AnimateFrameHandler
  _setFrameHandler (fn: DelayableFunction) {
    this._frameHandler = frame => {
      const { properties: { progress }, timestamp } = frame

      // Don't call delayable function until progress is 1
      if (progress.interpolated === 1) {
        fn(timestamp)
        this._delayed()
      } else {
        switch (this.status) {
        case 'ready':
        case 'paused':
        case 'sought':
        case 'delayed':
        case 'stopped':
          this._delaying()
          break
        }
      }
    }
  }
  _delaying () {
    this._computedStatus = 'delaying'
  }
  _delayed () {
    this._computedStatus = 'delayed'
  }

  delay () {
    switch (this.status) {
    case 'delaying':
      this._animateable.restart()
      break
    case 'sought':
      this.seek(0)
      this._animateable.play(frame => this._frameHandler(frame))
      break
    case 'ready':
    case 'paused':
    case 'delayed':
    case 'stopped':
      this._animateable.play(frame => this._frameHandler(frame))
    }

    return this
  }

  pause () {
    switch (this.status) {
    case 'delaying':
      this._animateable.pause()
      this._paused()
      break
    }
    
    return this
  }
  _paused () {
    this._computedStatus = 'paused'
  }

  resume () {
    switch (this.status) {
    case 'paused':
    case 'sought':
      this._animateable.play(frame => this._frameHandler(frame))
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
          this._frameHandler({
            properties: {
              progress: {
                progress: { time: 1, animation: 1 },
                interpolated: 1
              }
            },
            timestamp,
          })
        }
      })
    }

    this._animateable.seek(timeProgress, { handle: frame => this._frameHandler(frame) })
    this._sought()

    return this
  }
  _sought () {
    this._computedStatus = 'sought'
  }
  
  stop () {
    this._animateable.stop()
    this._stopped()

    return this
  }
  _stopped () {
    this._computedStatus = 'stopped'
  }
}
