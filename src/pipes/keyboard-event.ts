import { every, includes, map, pipe, some } from 'lazy-collections'
import {
  fromEventToKeyStatusKey,
  modifiers,
  createKeyStatuses,
  predicateDown,
  fromComboToAliases,
  fromAliasToKeyStatusKey,
  fromEventToAliases,
} from '../extracted'
import type { KeyStatusKey, KeyStatus } from '../extracted'

export type KeyboardEventFn<Returned> = (keyboardEvent: KeyboardEvent) => Returned

export type CreatePredicateKeycomboMatchOptions = {
  toKey?: (alias: string) => KeyStatusKey,
  toAliases?: (event: KeyboardEvent) => string[],
}

const defaultOptions: CreatePredicateKeycomboMatchOptions = {
  toKey: alias => fromAliasToKeyStatusKey(alias),
  toAliases: event => fromEventToAliases(event),
}

export const createPredicateKeycomboMatch = (
  keycombo: string,
  options: CreatePredicateKeycomboMatchOptions = {},
): KeyboardEventFn<boolean> => {
  const { toKey, toAliases } = { ...defaultOptions, ...options },
        aliases = fromComboToAliases(keycombo),
        keys = map<string, KeyStatusKey>(toKey)(aliases)

  return event => {
    const { toValue, set, toEntries } = createKeyStatuses()

    set(fromEventToKeyStatusKey(event), 'down')

    for (const modifier of modifiers) {
      if (event[`${modifier.toLowerCase()}Key`]) set({ key: modifier }, 'down')
    }

    return (
      every<KeyStatusKey>(pipe(
        toValue,
        predicateDown,
      ))(keys) as boolean
      && every<[KeyStatusKey, KeyStatus]>(
        ([key]) => some(
          alias => includes(alias)(aliases) as boolean
        )(toAliases(key as KeyboardEvent)) as boolean
      )(toEntries()) as boolean
    )
  }
}

