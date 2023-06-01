import { Compareable } from '../classes'
import type { StringFn } from './string'

type MatchKind = 'variant' | 'case' | 'accent'

export function createMatchKinds (name: string): StringFn<MatchKind[]> {
  const variantSensitive = new Compareable(name, { collator: { sensitivity: 'variant' } }),
        caseSensitive = new Compareable(name, { collator: { sensitivity: 'case' } }),
        accentSensitive = new Compareable(name, { collator: { sensitivity: 'accent' } })

  return key => {
    let matchKinds: MatchKind[] = []

    if (key.length === 1) {
      if (!variantSensitive.compare(key)) matchKinds.push('variant')
      if (!caseSensitive.compare(key)) matchKinds.push('case')
      if (!accentSensitive.compare(key)) matchKinds.push('accent')

      return matchKinds
    }
  }
}
