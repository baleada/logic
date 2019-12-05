import toMouseEquivalent from './toMouseEquivalent'

export default function(touchListeners) {
  return touchListeners
    .map(([touchType, listener]) => [toMouseEquivalent(touchType), listener])
    .filter(([mouseType]) => !!mouseType)
}
