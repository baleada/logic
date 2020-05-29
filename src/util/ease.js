import mix from 'mix-css-color'
import is from './is'

export default function ease (previous, next, progress, options = {}) {
  if (is.undefined(previous)) {
    return next
  } else {
    let eased
  
    // TODO validate matching previous and next types

    if (is.number(previous)) {
      eased = (next - previous) * progress + previous
    } else if (is.string(previous)) {
      eased = mix(previous, next, progress * 100)
    } else if (is.array(previous)) {
      const sliceToExact = (next.length - previous.length) * progress + previous.length,
            nextIsLonger = next.length > previous.length,
            sliceTo = nextIsLonger ? Math.floor(sliceToExact) : Math.ceil(sliceToExact),
            shouldBeSliced = nextIsLonger ? next : previous
      eased = shouldBeSliced.slice(0, sliceTo)
    }

    return eased
  }
}
