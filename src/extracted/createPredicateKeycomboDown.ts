import { every, map, pipe } from 'lazy-collections'
import type { KeyStatusKey } from './createKeyStatuses'
import { fromComboToAliases } from './fromComboToAliases'
import { fromAliasToDownKeys } from './fromAliasToDownKeys'
import type { KeyStatusFunction } from './types'

export type CreatePredicateKeycomboDownOptions = {
  toDownKeys?: (alias: string) => KeyStatusKey[],
}

const defaultOptions: CreatePredicateKeycomboDownOptions = {
  toDownKeys: alias => fromAliasToDownKeys(alias),
}

export const createPredicateKeycomboDown = (
  keycombo: string,
  options: CreatePredicateKeycomboDownOptions = {},
): KeyStatusFunction<boolean> => {
  const { toDownKeys } = { ...defaultOptions, ...options },
        downKeys = pipe<string>(
          fromComboToAliases,
          map<string, KeyStatusKey[]>(toDownKeys),
        )(keycombo) as KeyStatusKey[][]

  return statuses => {
    const predicateAliasEntriesDown = every<KeyStatusKey>(
            key => statuses.toValue(key) === 'down'
          ) as (aliasDownKeys: KeyStatusKey[]) => boolean

    return every<KeyStatusKey[]>(predicateAliasEntriesDown)(downKeys) as boolean
  }
}

