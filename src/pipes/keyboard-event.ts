import { every, map, pipe } from 'lazy-collections'
import {
  fromEventToKeyStatusKey,
  modifiers,
  createKeyStatuses,
  predicateDown,
  fromComboToAliases,
  fromAliasToKeyStatusKey,
} from '../extracted'
import type {
  KeyStatusKey,
} from '../extracted'

export type KeyboardEventFn<Returned> = (keyboardEvent: KeyboardEvent) => Returned

export type CreatePredicateKeycomboMatchOptions = {
  toKey?: (alias: string) => KeyStatusKey,
}

const defaultOptions: CreatePredicateKeycomboMatchOptions = {
  toKey: fromAliasToKeyStatusKey,
}

export const createPredicateKeycomboMatch = (
  keycombo: string,
  options: CreatePredicateKeycomboMatchOptions = {},
): KeyboardEventFn<boolean> => {
  const { toKey } = { ...defaultOptions, ...options },
        keys = pipe(
          fromComboToAliases,
          map<string, KeyStatusKey>(toKey),
        )(keycombo)

  return event => {
    const { toValue, set } = createKeyStatuses()

    set(fromEventToKeyStatusKey(event), 'down')

    for (const modifier of modifiers) {
      if (event[`${modifier.toLowerCase()}Key`]) set({ key: modifier }, 'down')
    }

    return (
      every<KeyStatusKey>(pipe(
        toValue,
        predicateDown,
      ))(keys) as boolean
    )
  }
}

