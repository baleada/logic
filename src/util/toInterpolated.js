import mix from 'mix-css-color'
import isUndefined from './isUndefined.js'
import isNumber from './isNumber.js'
import isString from './isString.js'
import isArray from './isArray.js'

export default function toInterpolated ({ previous, next, progress }, options = {}) {
  if (isUndefined(previous)) {
    return next
  }

  const type = (isNumber(previous) && 'number') ||
    (isString(previous) && 'color') ||
    (isArray(previous) && 'array')

  return (() => {
    switch (type) {
      case 'number':
        return (next - previous) * progress + previous
      case 'color':
        return mix(previous, next, (1 - progress) * 100).hexa // No clue why this progress needs to be inverted, but it works
      case 'array':
        const sliceToExact = (next.length - previous.length) * progress + previous.length,
              nextIsLonger = next.length > previous.length,
              sliceTo = nextIsLonger ? Math.floor(sliceToExact) : Math.ceil(sliceToExact),
              shouldBeSliced = nextIsLonger ? next : previous
      return shouldBeSliced.slice(0, sliceTo)
    }
  })()
}
