import { every, includes, map, pipe, some } from 'lazy-collections'
import { createValue, createCode } from './key-statuses'
import type { KeyStatuses, KeyStatusCode } from './key-statuses'
import { fromComboToAliases } from './fromComboToAliases'
import { fromAliasToDownCodes } from './fromAliasToDownCodes'
import { fromCodeToAliases } from './fromCodeToAliases'
import type { CreateKeycomboDownOptions } from './createKeycomboDown'
import type { KeyStatusFunction } from './types'

export type CreateKeycomboMatchOptions = CreateKeycomboDownOptions & {
  toAliases?: (code: KeyStatusCode) => string[],
}

const defaultOptions: CreateKeycomboMatchOptions = {
  toDownCodes: alias => fromAliasToDownCodes(alias),
  toAliases: code => fromCodeToAliases(code),
}

export const createKeycomboMatch = (
  keycombo: string,
  options: CreateKeycomboMatchOptions = {},
): KeyStatusFunction<boolean> => {
  const { toDownCodes, toAliases } = { ...defaultOptions, ...options },
        aliases = fromComboToAliases(keycombo),
        downCodes = map<string, KeyStatusCode[]>(toDownCodes)(aliases)        

  return statuses => {
    const predicateAliasDown = every<KeyStatusCode>(
      code => createValue(code, { predicateKey: createCode(code) })(statuses) === 'down'
    ) as (aliasDownCodes: KeyStatusCode[]) => boolean

    return (
      every<KeyStatusCode[]>(arr => predicateAliasDown(arr))(downCodes) as boolean
      && every<KeyStatuses[number]>(
        ([code, value]) => value === 'up'
          || pipe<KeyboardEvent>(
            toAliases,
            some(alias => includes(alias)(aliases) as boolean),
          )(code)
      )(statuses) as boolean
    )
  }
}

