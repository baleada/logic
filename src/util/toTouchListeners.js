import { touchListenerGetters } from '../constants'

export default function({ touchType, listener }, options = {}) {
  return toTouchListeners[touchType](listener, options)
}
