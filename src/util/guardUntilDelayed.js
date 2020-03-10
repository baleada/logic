export default function guardUntilDelayed (naiveCallback) {
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