import { every, includes, map, pipe, some } from 'lazy-collections'
import { createValue, createCode } from './key-statuses'
import type { KeyStatuses, KeyStatusCode } from './key-statuses'
import { createAliases } from './createAliases'
import { fromAliasToCode } from './fromAliasToCode'
import { fromCodeToAliases } from './fromCodeToAliases'
import type { CreateKeycomboDownOptions } from './createKeycomboDown'
import type { KeyStatusFunction } from './types'

export type CreateKeycomboMatchOptions = CreateKeycomboDownOptions & {
  toAliases?: (code: KeyStatusCode) => string[],
}

const defaultOptions: CreateKeycomboMatchOptions = {
  toCode: alias => fromAliasToCode(alias),
  toAliases: code => fromCodeToAliases(code),
}

export const createKeycomboMatch = (
  keycombo: string,
  options: CreateKeycomboMatchOptions = {},
): KeyStatusFunction<boolean> => {
  const { toLonghand, toCode, toAliases } = { ...defaultOptions, ...options },
        aliases = createAliases({ toLonghand })(keycombo),
        codes = map<string, KeyStatusCode>(toCode)(aliases)

  return statuses => (
    every<KeyStatusCode>(
      code => createValue(
        code,
        { predicateKey: createCode(code) }
      )(statuses) === 'down'
    )(codes) as boolean
    && every<KeyStatuses[number]>(
      ([code, value]) => value === 'up'
        || pipe<KeyboardEvent>(
          toAliases,
          some(alias => includes(alias)(aliases) as boolean),
        )(code)
    )(statuses) as boolean
  )
}

