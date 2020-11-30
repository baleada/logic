import mix from 'mix-css-color'
import is from './is.js'

export default function toInterpolated ({ previous, next, progress }, options = {}) {
  if (is.undefined(previous)) {
    return next
  }

  const type = (is.number(previous) && 'number') ||
    (is.string(previous) && 'color') ||
    (is.array(previous) && 'array')

  return (() => {
    switch (type) {
      case 'number':
        return (next - previous) * progress + previous
      case 'color':
        return mix(previous, next, progress * 100).hexa
      case 'array':
        const sliceToExact = (next.length - previous.length) * progress + previous.length,
              nextIsLonger = next.length > previous.length,
              sliceTo = nextIsLonger ? Math.floor(sliceToExact) : Math.ceil(sliceToExact),
              shouldBeSliced = nextIsLonger ? next : previous
      return shouldBeSliced.slice(0, sliceTo)
    }
  })()
}
