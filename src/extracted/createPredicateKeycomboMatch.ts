import { every, includes, map, pipe, some } from 'lazy-collections'
import type { KeyStatusKey , KeyStatus } from './createKeyStatuses'
import { fromComboToAliases } from './fromComboToAliases'
import { fromAliasToDownKeys } from './fromAliasToDownKeys'
import { fromEventToAliases } from './fromEventToAliases'
import type { CreatePredicateKeycomboDownOptions } from './createPredicateKeycomboDown'
import type { KeyStatusFunction } from './types'

export type CreatePredicateKeycomboMatchOptions = CreatePredicateKeycomboDownOptions & {
  toAliases?: (key: KeyStatusKey) => string[],
}

const defaultOptions: CreatePredicateKeycomboMatchOptions = {
  toDownKeys: alias => fromAliasToDownKeys(alias),
  toAliases: event => fromEventToAliases(event as KeyboardEvent),
}

export const createPredicateKeycomboMatch = (
  keycombo: string,
  options: CreatePredicateKeycomboMatchOptions = {},
): KeyStatusFunction<boolean> => {
  const { toDownKeys, toAliases } = { ...defaultOptions, ...options },
        aliases = fromComboToAliases(keycombo),
        downKeys = map<string, KeyStatusKey[]>(toDownKeys)(aliases)

  return statuses => {
    const predicateAliasDown = every<KeyStatusKey>(
            key => statuses.toValue(key) === 'down'
          ) as (aliasDownKeys: KeyStatusKey[]) => boolean

    return (
      every<KeyStatusKey[]>(predicateAliasDown)(downKeys) as boolean
      && every<[KeyStatusKey, KeyStatus]>(
        ([key, value]) => value === 'up'
          || pipe<KeyboardEvent>(
            toAliases,
            some(alias => includes(alias)(aliases) as boolean),
          )(key as KeyboardEvent)
      )(statuses.toEntries()) as boolean
    )
  }
}

