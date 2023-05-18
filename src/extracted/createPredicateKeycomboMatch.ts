import { every, includes, pipe, some } from 'lazy-collections'
import type { KeyStatuses, KeyStatusKey } from './createKeyStatuses'
import { fromComboToAliases } from './fromComboToAliases'
import { fromAliasToKeyStatusKey } from './fromAliasToKeyStatusKey'
import { fromEventToAliases } from './fromEventToAliases'
import type { CreatePredicateKeycomboDownOptions } from './createPredicateKeycomboDown'

export type KeyStatusFunction<Returned> = (statuses: KeyStatuses) => Returned

export type CreatePredicateKeycomboMatchOptions = CreatePredicateKeycomboDownOptions & {
  toAliases?: (key: KeyStatusKey) => string[],
}

const defaultOptions: CreatePredicateKeycomboMatchOptions = {
  toKey: fromAliasToKeyStatusKey,
  toAliases: fromEventToAliases,
}

export const createPredicateKeycomboMatch = (
  keycombo: string,
  options: CreatePredicateKeycomboMatchOptions = {},
): KeyStatusFunction<boolean> => {
  const aliases = fromComboToAliases(keycombo),
        { toKey, toAliases } = { ...defaultOptions, ...options }

  return statuses => {
    const { toValue } = statuses

    return (
      every<string>(pipe(
        toKey,
        toValue,
        value => value === 'down'
      ))(aliases) as boolean
      && every<[KeyStatusKey, 'down' | 'up']>(
      ([key, value]) =>
          value === 'up'
          || some(
            alias => includes(alias)(aliases) as boolean
          )(toAliases(key as KeyboardEvent)) as boolean
      )(statuses.toEntries()) as boolean
    )
  }
}

