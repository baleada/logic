import toMouseEquivalent from './toMouseEquivalent'

export default function(touchListeners) {
  return touchListeners
    .map(([touchType, ...rest]) => [toMouseEquivalent(touchType), ...rest])
    .filter(([mouseType]) => !!mouseType)
}
