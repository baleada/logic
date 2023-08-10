import { every, includes, map, pipe, some } from 'lazy-collections'
import { createValue, createPredicateKey } from './key-statuses'
import type { KeyStatuses, KeyStatusKey } from './key-statuses'
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
            key => createValue(key, { predicateKey: createPredicateKey(key) })(statuses) === 'down'
          ) as (aliasDownKeys: KeyStatusKey[]) => boolean

    return (
      every<KeyStatusKey[]>(predicateAliasDown)(downKeys) as boolean
      && every<KeyStatuses[number]>(
        ([key, value]) => value === 'up'
          || pipe<KeyboardEvent>(
            toAliases,
            some(alias => includes(alias)(aliases) as boolean),
          )(key as KeyboardEvent)
      )(statuses) as boolean
    )
  }
}

