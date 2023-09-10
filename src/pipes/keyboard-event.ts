import {
  every,
  find,
  includes,
  map,
  pipe,
  some,
} from 'lazy-collections'
import {
  fromEventToKeyStatusCode,
  modifiers,
  createKeyStatusesValue as createValue,
  createKeyStatusesSet as createSet,
  createAliases,
  fromAliasToCode,
  createKeyStatusCode,
  fromKeyboardEventDescriptorToAliases,
} from '../extracted'
import type {
  KeyStatusCode,
  KeyStatus,
  KeyStatuses,
  KeyboardEventDescriptor,
  CreateKeycomboMatchOptions as CreateKeyStatusesKeycomboMatchOptions,
} from '../extracted'
import { createMap } from './array'

export type KeyboardEventTransform<Transformed> = (keyboardEvent: KeyboardEvent) => Transformed

export type CreateKeycomboMatchOptions = Omit<CreateKeyStatusesKeycomboMatchOptions, 'toAliases'> & {
  toAliases?: (descriptor: KeyboardEventDescriptor) => string[],
}

const defaultOptions: CreateKeycomboMatchOptions = {
  toCode: alias => fromAliasToCode(alias),
  toAliases: descriptor => fromKeyboardEventDescriptorToAliases(descriptor),
}

export const createKeycomboMatch = (
  keycombo: string,
  options: CreateKeycomboMatchOptions = {},
): KeyboardEventTransform<boolean> => {
  const { toLonghand, toCode, toAliases: fromDescriptorToAliases } = { ...defaultOptions, ...options },
        fromComboToAliases = createAliases({ toLonghand }),
        aliases = fromComboToAliases(keycombo),
        codes = createMap<string, KeyStatusCode>(toCode)(aliases),
        implicitModifierAliases = (() => {
          const implicitModifierAliases: string[] = []

          for (const code of codes) {
            const implicitModifier = find<typeof modifiers[number]>(
              modifier => code.includes(modifier)
            )(modifiers) as string
            
            if (implicitModifier) implicitModifierAliases.push(implicitModifier.toLowerCase())
          }

          return implicitModifierAliases
        })()

  return event => {
    const statuses: KeyStatuses = []

    createSet(fromEventToKeyStatusCode(event), 'down')(statuses)

    for (const modifier of modifiers) {
      if (event[`${modifier.toLowerCase()}Key`]) createSet(modifier, 'down')(statuses)
    }

    const events = createMap<[KeyStatusCode, KeyStatus], KeyboardEventDescriptor>(
      ([code]) => {
        const e: KeyboardEventDescriptor = { code }

        for (const modifier of modifiers) {
          e[`${modifier.toLowerCase()}Key`] = event[`${modifier.toLowerCase()}Key`]
        }

        return e
      }
    )(statuses)

    return (
      every<KeyStatusCode>(
        code => createValue(
          code,
          { predicateKey: createKeyStatusCode(code) }
        )(statuses) === 'down'
      )(codes) as boolean
      && every<KeyboardEventDescriptor>(
        e => pipe<KeyboardEventDescriptor>(
          fromDescriptorToAliases,
          map<string, string[]>(fromComboToAliases),
          some<string[]>(longhandAliases =>
            every<string>(longhandAlias =>
              includes<string>(longhandAlias)(aliases) as boolean
              || includes<string>(longhandAlias)(implicitModifierAliases) as boolean
            )(longhandAliases) as boolean
          ),
        )(e)
      )(events) as boolean
    )
  }
}
