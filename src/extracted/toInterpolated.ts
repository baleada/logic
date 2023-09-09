import type { AnimateOptions } from '../classes'
import { createMix } from '../pipes/color'
import { createSlice } from '../pipes/array'
import {
  predicateUndefined,
  predicateNumber,
  predicateString,
  predicateArray,
} from './predicates'

export function toInterpolated (
  { previous, next, progress }: {
    previous: string | number | any[] | undefined,
    next: string | number | any[],
    progress: number
  },
  options: AnimateOptions['interpolate'] = {}
) {
  if (predicateUndefined(previous)) {
    return next
  }

  if (predicateNumber(previous) && predicateNumber(next)) {
    return (next  - previous) * progress + previous
  }

  if (predicateString(previous) && predicateString(next)) {
    const { color: createMixOptions } = options    
    return createMix(`${next} ${progress * 100}%`, createMixOptions)(previous)
  }

  if (predicateArray(previous) && predicateArray(next)) {
    const exactSliceEnd = (next.length - previous.length) * progress + previous.length,
    nextIsLonger = next.length > previous.length,
    sliceEnd = nextIsLonger ? Math.floor(exactSliceEnd) : Math.ceil(exactSliceEnd),
    sliceTarget = nextIsLonger ? next : previous

    return createSlice(0, sliceEnd)(sliceTarget)
  }
}
