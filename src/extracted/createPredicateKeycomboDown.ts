import { every, pipe } from 'lazy-collections'
import type { KeyStatuses, KeyStatusKey } from './createKeyStatuses'
import { fromComboToAliases } from './fromComboToAliases'
import { fromAliasToKeyStatusKey } from './fromAliasToKeyStatusKey'

export type KeyStatusFunction<Returned> = (statuses: KeyStatuses) => Returned

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
  const aliases = fromComboToAliases(keycombo),
        { toKey } = { ...defaultOptions, ...options }

  return statuses => {
    const { toValue } = statuses

    return every<string>(pipe(
      toKey,
      toValue,
      value => value === 'down'
    ))(aliases) as boolean
  }
}

