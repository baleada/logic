import { pipe } from 'lazy-collections'
import { fromComboToAliases } from './fromComboToAliases'
import { toLength } from './lazy-collections'

export const fromComboToAliasesLength = pipe(
  fromComboToAliases,
  toLength(),
)
