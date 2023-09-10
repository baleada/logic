import { pipe, toLength } from 'lazy-collections'
import { createAliases } from './createAliases'
import type { CreateAliasesOptions } from './createAliases'

export function createAliasesLength (options?: CreateAliasesOptions) {
  return pipe(
    createAliases(options),
    toLength(),
  )
}
