import { mouseEquivalents } from '../dictionaries'

export default function(touchListeners) {
  return touchListeners
    .map(([eventType, listener]) => [mouseEquivalents[eventType], listener])
    .filter(([eventType]) => !!eventType)
}
