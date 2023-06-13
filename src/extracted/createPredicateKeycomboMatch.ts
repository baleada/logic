import { every, includes, map, pipe, some } from 'lazy-collections'
import { predicateDown } from './createKeyStatuses'
import type { KeyStatusKey , KeyStatus } from './createKeyStatuses'
import { fromComboToAliases } from './fromComboToAliases'
import { fromAliasToKeyStatusKey } from './fromAliasToKeyStatusKey'
import { fromEventToAliases } from './fromEventToAliases'
import type { CreatePredicateKeycomboDownOptions } from './createPredicateKeycomboDown'
import type { KeyStatusFunction } from './types'

export type CreatePredicateKeycomboMatchOptions = CreatePredicateKeycomboDownOptions & {
  toAliases?: (key: KeyStatusKey) => string[],
}

const defaultOptions: CreatePredicateKeycomboMatchOptions = {
  toKey: alias => fromAliasToKeyStatusKey(alias),
  toAliases: event => fromEventToAliases(event as KeyboardEvent),
}

export const createPredicateKeycomboMatch = (
  keycombo: string,
  options: CreatePredicateKeycomboMatchOptions = {},
): KeyStatusFunction<boolean> => {
  const { toKey, toAliases } = { ...defaultOptions, ...options },
        aliases = fromComboToAliases(keycombo),
        keys = map<string, KeyStatusKey>(toKey)(aliases)

  return statuses => {
    const { toValue } = statuses

    return (
      every<KeyStatusKey>(pipe(
        toValue,
        predicateDown,
      ))(keys) as boolean
      && every<[KeyStatusKey, KeyStatus]>(
        ([key, value]) => value === 'up'
          || some(
            alias => includes(alias)(aliases) as boolean
          )(toAliases(key as KeyboardEvent)) as boolean
      )(statuses.toEntries()) as boolean
    )
  }
}

