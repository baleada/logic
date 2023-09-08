import { every, map, pipe } from 'lazy-collections'
import type { KeyStatusCode } from './key-statuses'
import { fromComboToAliases } from './fromComboToAliases'
import { fromAliasToDownCodes } from './fromAliasToDownCodes'
import type { KeyStatusFunction } from './types'
import { createValue, createCode } from './key-statuses'

export type CreateKeycomboDownOptions = {
  toDownCodes?: (alias: string) => KeyStatusCode[],
}

const defaultOptions: CreateKeycomboDownOptions = {
  toDownCodes: alias => fromAliasToDownCodes(alias),
}

export const createKeycomboDown = (
  keycombo: string,
  options: CreateKeycomboDownOptions = {},
): KeyStatusFunction<boolean> => {
  const { toDownCodes } = { ...defaultOptions, ...options },
        downCodes = pipe<string>(
          fromComboToAliases,
          map<string, KeyStatusCode[]>(toDownCodes),
        )(keycombo) as KeyStatusCode[][]

  return statuses => {
    const predicateAliasEntriesDown = every<KeyStatusCode>(
      code => createValue(code, { predicateKey: createCode(code) })(statuses) === 'down'
    ) as (aliasDownCodes: KeyStatusCode[]) => boolean

    return every<KeyStatusCode[]>(predicateAliasEntriesDown)(downCodes) as boolean
  }
}

