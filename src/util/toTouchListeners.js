import { touchListenerGetters } from '../dictionaries'

export default function({ touchType, listener }, options = {}) {
  return toTouchListeners[touchType](listener, options)
}
