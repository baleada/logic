import { every, find, includes, pipe, some } from 'lazy-collections'
import {
  fromEventToKeyStatusCode,
  modifiers,
  createKeyStatusesValue as createValue,
  createKeyStatusesSet as createSet,
  fromComboToAliases,
  fromAliasToDownCodes,
  fromEventToAliases,
  createKeyStatusCode,
} from '../extracted'
import type { KeyStatusCode, KeyStatus, KeyStatuses } from '../extracted'
import { createMap } from './array'

export type KeyboardEventTransform<Transformed> = (keyboardEvent: KeyboardEvent) => Transformed

export type CreateKeycomboMatchOptions = {
  toDownCodes?: (alias: string) => KeyStatusCode[],
  toAliases?: (event: KeyboardEvent) => string[],
}

const defaultOptions: CreateKeycomboMatchOptions = {
  toDownCodes: alias => fromAliasToDownCodes(alias),
  toAliases: event => fromEventToAliases(event),
}

export const createKeycomboMatch = (
  keycombo: string,
  options: CreateKeycomboMatchOptions = {},
): KeyboardEventTransform<boolean> => {
  const { toDownCodes, toAliases } = { ...defaultOptions, ...options },
        aliases = fromComboToAliases(keycombo),
        downCodes = createMap<string, KeyStatusCode[]>(toDownCodes)(aliases),
        implicitModifierAliases = (() => {
          const implicitModifierAliases: typeof modifiers[number][] = []

          for (const aliasDownCodes of downCodes) {
            for (const code of aliasDownCodes) {
              const implicitModifier = find<string>(
                modifier => code.includes(modifier)
              )(modifiers) as string
              
              if (implicitModifier) implicitModifierAliases.push(implicitModifier.toLowerCase())
            }
          }

          return implicitModifierAliases
        })()

  return event => {
    const statuses: KeyStatuses = [],
          predicateAliasDown = every<KeyStatusCode>(
            code => createValue(code, { predicateKey: createKeyStatusCode(code) })(statuses) === 'down'
          ) as (entries: KeyStatusCode[]) => boolean

    createSet(fromEventToKeyStatusCode(event), 'down')(statuses)

    for (const modifier of modifiers) {
      if (event[`${modifier.toLowerCase()}Key`]) createSet(modifier, 'down')(statuses)
    }

    const events = createMap<[KeyStatusCode, KeyStatus], KeyboardEvent>(
      ([code]) => {
        const e = { code }

        for (const modifier of modifiers) {
          e[`${modifier.toLowerCase()}Key`] = event[`${modifier.toLowerCase()}Key`]
        }

        return e as KeyboardEvent
      }
    )(statuses)

    return (
      every<KeyStatusCode[]>(predicateAliasDown)(downCodes) as boolean
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
