import {
  pipe,
  unique,
  map,
  toArray,
  flatMap,
} from 'lazy-collections'
import { createSplit } from '../pipes/string'
import { fromShorthandAliasToLonghandAlias } from './fromShorthandAliasToLonghandAlias'

export type CreateAliasesOptions = {
  toLonghand?: (shorthand: string) => string,
}

export function createAliases (options: CreateAliasesOptions = {}): (combo: string) => string[] {
  const { toLonghand = fromShorthandAliasToLonghandAlias } = options

  return combo => {
    const separator = '+',
          splitByPlus = createSplit({ separator })
  
    return pipe(
      splitByPlus,
      flatMap<string, string[]>(
        alias => pipe(
          toLonghand,
          splitByPlus,
        )(alias)
      ),
      // If the separator is used as a character in the type,
      // two empty strings will be produced by the split.
      // unique() combines those two into one, and also removes
      // duplicates in longhand transformations.
      unique<string>(),
      map<string, string>(name => name === '' ? separator : name.toLowerCase()),
      toArray(),
    )(combo) as string[]
  }
}
