import { every, map, pipe } from 'lazy-collections'
import { predicateDown } from './createKeyStatuses'
import type { KeyStatusKey } from './createKeyStatuses'
import { fromComboToAliases } from './fromComboToAliases'
import { fromAliasToKeyStatusKey } from './fromAliasToKeyStatusKey'
import type { KeyStatusFunction } from './types'

export type CreatePredicateKeycomboDownOptions = {
  toKey?: (alias: string) => KeyStatusKey,
}

const defaultOptions: CreatePredicateKeycomboDownOptions = {
  toKey: fromAliasToKeyStatusKey,
}

export const createPredicateKeycomboDown = (
  keycombo: string,
  options: CreatePredicateKeycomboDownOptions = {},
): KeyStatusFunction<boolean> => {
  const { toKey } = { ...defaultOptions, ...options },
        keys = pipe(
          fromComboToAliases,
          map<string, KeyStatusKey>(toKey),
        )(keycombo)

  return statuses => {
    const { toValue } = statuses

    return every<string>(pipe(
      toValue,
      predicateDown,
    ))(keys) as boolean
  }
}

