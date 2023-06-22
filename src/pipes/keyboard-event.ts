import { every, includes, pipe, some } from 'lazy-collections'
import {
  fromEventToKeyStatusKey,
  modifiers,
  createKeyStatuses,
  fromComboToAliases,
  fromAliasToDownKeys,
  fromEventToAliases,
} from '../extracted'
import type { KeyStatusKey, KeyStatus } from '../extracted'
import { createMap } from './array'

export type KeyboardEventFn<Returned> = (keyboardEvent: KeyboardEvent) => Returned

export type CreatePredicateKeycomboMatchOptions = {
  toDownKeys?: (alias: string) => KeyStatusKey[],
  toAliases?: (event: KeyboardEvent) => string[],
}

const defaultOptions: CreatePredicateKeycomboMatchOptions = {
  toDownKeys: alias => fromAliasToDownKeys(alias),
  toAliases: event => fromEventToAliases(event),
}

export const createPredicateKeycomboMatch = (
  keycombo: string,
  options: CreatePredicateKeycomboMatchOptions = {},
): KeyboardEventFn<boolean> => {
  const { toDownKeys, toAliases } = { ...defaultOptions, ...options },
        aliases = fromComboToAliases(keycombo),
        downKeys = createMap<string, KeyStatusKey[]>(toDownKeys)(aliases),
        implicitModifierAliases = (() => {
          const implicitModifierAliases: typeof modifiers[number][] = []

          for (const aliasDownKeys of downKeys) {
            for (const { key } of aliasDownKeys) {
              if (includes<string>(key)(modifiers)) implicitModifierAliases.push(key.toLowerCase())
            }
          }

          return implicitModifierAliases
        })()

  return event => {
    const statuses = createKeyStatuses(),
          predicateAliasDown = every<KeyStatusKey>(
            key => statuses.toValue(key) === 'down'
          ) as (entries: KeyStatusKey[]) => boolean

    statuses.set(fromEventToKeyStatusKey(event), 'down')

    for (const modifier of modifiers) {
      if (event[`${modifier.toLowerCase()}Key`]) statuses.set({ key: modifier }, 'down')
    }

    const events = createMap<[KeyStatusKey, KeyStatus], KeyboardEvent>(
      ([key]) => {
        const e = { ...key }

        for (const modifier of modifiers) {
          e[`${modifier.toLowerCase()}Key`] = event[`${modifier.toLowerCase()}Key`]
        }

        return e as KeyboardEvent
      }
    )(statuses.toEntries())    

    return (
      every<KeyStatusKey[]>(predicateAliasDown)(downKeys) as boolean
      && every<KeyboardEvent>(
        e => pipe<KeyboardEvent>(
          toAliases,
          some<string>(
            alias => (
              includes<string>(alias)(aliases) as boolean
              || includes<string>(alias)(implicitModifierAliases) as boolean
            )
          ),
        )(e)
      )(events) as boolean
    )
  }
}
