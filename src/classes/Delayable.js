import { Animateable } from './Animateable.js'

const defaultOptions = {
  delay: 0,
  executions: 1,
}

export class Delayable {
  constructor (callback, options) {
    this._animateable = new Animateable(
      [
        { progress: 0, data: { progress: 0 } },
        { progress: 1, data: { progress: 1 } }
      ],
      {
        duration: options?.delay ?? defaultOptions.delay,
        iterations: options?.executions ?? defaultOptions.executions,
      }
    )

    this.setCallback(callback)
    this._ready()
  }
  _ready () {
    this._computedStatus = 'ready'
  }

  get callback () {
    return this._computedCallback
  }
  set callback (callback) {
    this.setCallback(callback)
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

  setCallback (naiveCallback) {
    this.stop()

    this._computedCallback = guardUntilDelayed(naiveCallback)

    return this
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
      this._animateable.play(frame => this.callback(frame))
      break
    case 'ready':
    case 'paused':
    case 'delayed':
    case 'stopped':
      this._animateable.play(frame => this.callback(frame))
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
      this._animateable.play(frame => this.callback(frame))
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

  seek (timeProgress) {
    const executions = Math.floor(timeProgress)

  if (executions > 0) {
    window.requestAnimationFrame(timestamp => {
        for (let i = 0; i < executions; i++) {
          this.callback({
            data: { progress: 1 },
            timestamp
          })
        }
      })
    }

    this._animateable.seek(timeProgress, timestamp => this.callback(timestamp))
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

function guardUntilDelayed (naiveCallback) {
  function callback (frame) {
    const { data: { progress }, timestamp } = frame

    if (progress === 1) {
      naiveCallback(timestamp)
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

  return callback
}
