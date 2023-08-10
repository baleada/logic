import { every, includes, pipe, some } from 'lazy-collections'
import {
  fromEventToKeyStatusKey,
  modifiers,
  createKeyStatusesValue as createValue,
  createKeyStatusesSet as createSet,
  fromComboToAliases,
  fromAliasToDownKeys,
  fromEventToAliases,
  createPredicateKeyStatusKey,
} from '../extracted'
import type { KeyStatusKey, KeyStatus, KeyStatuses } from '../extracted'
import { createMap } from './array'

export type KeyboardEventTransform<Transformed> = (keyboardEvent: KeyboardEvent) => Transformed

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
): KeyboardEventTransform<boolean> => {
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
    const statuses: KeyStatuses = [],
          predicateAliasDown = every<KeyStatusKey>(
            key => createValue(key, { predicateKey: createPredicateKeyStatusKey(key) })(statuses) === 'down'
          ) as (entries: KeyStatusKey[]) => boolean

    createSet(fromEventToKeyStatusKey(event), 'down')(statuses)

    for (const modifier of modifiers) {
      if (event[`${modifier.toLowerCase()}Key`]) createSet({ key: modifier }, 'down')(statuses)
    }

    const events = createMap<[KeyStatusKey, KeyStatus], KeyboardEvent>(
      ([key]) => {
        const e = { ...key }

        for (const modifier of modifiers) {
          e[`${modifier.toLowerCase()}Key`] = event[`${modifier.toLowerCase()}Key`]
        }

        return e as KeyboardEvent
      }
    )(statuses)    

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
