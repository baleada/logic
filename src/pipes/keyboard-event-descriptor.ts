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

export type KeyboardEventDescriptorTransform<Transformed> = (descriptor: KeyboardEventDescriptor) => Transformed

export type CreateKeycomboMatchOptions = Omit<CreateKeyStatusesKeycomboMatchOptions, 'toAliases'> & {
  toAliases?: (descriptor: KeyboardEventDescriptor) => string[],
}

const defaultOptions: CreateKeycomboMatchOptions = {
  toCode: alias => fromAliasToCode(alias),
  toAliases: descriptor => fromKeyboardEventDescriptorToAliases(descriptor),
}

/**
 * [Docs](https://baleada.dev/docs/logic/pipes/keycombo-match)
 */
export const createKeycomboMatch = (
  keycombo: string,
  options: CreateKeycomboMatchOptions = {},
): KeyboardEventDescriptorTransform<boolean> => {
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

  return descriptor => {
    const statuses: KeyStatuses = []

    if (descriptor.code) createSet(fromEventToKeyStatusCode(descriptor), 'down')(statuses)

    for (const modifier of modifiers) {
      const prefix = modifier === 'Control' ? 'ctrl' : modifier.toLowerCase()
      if (descriptor[`${prefix}Key`]) createSet(modifier, 'down')(statuses)
    }

    const descriptors = createMap<[KeyStatusCode, KeyStatus], KeyboardEventDescriptor>(
      ([code]) => {
        const newDescriptor: KeyboardEventDescriptor = { code }

        for (const modifier of modifiers) {
          const prefix = modifier === 'Control' ? 'ctrl' : modifier.toLowerCase()
          newDescriptor[`${prefix}Key`] = descriptor[`${prefix}Key`]
        }

        return newDescriptor
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
        d => pipe<KeyboardEventDescriptor>(
          fromDescriptorToAliases,
          map<string, string[]>(fromComboToAliases),
          some<string[]>(longhandAliases =>
            every<string>(longhandAlias =>
              includes<string>(longhandAlias)(aliases) as boolean
              || includes<string>(longhandAlias)(implicitModifierAliases) as boolean
            )(longhandAliases) as boolean
          ),
        )(d)
      )(descriptors) as boolean
    )
  }
}
