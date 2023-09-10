import { every, map, pipe } from 'lazy-collections'
import type { KeyStatusCode } from './key-statuses'
import { createAliases } from './createAliases'
import type { CreateAliasesOptions } from './createAliases'
import { fromAliasToCode } from './fromAliasToCode'
import type { KeyStatusFunction } from './types'
import { createValue, createCode } from './key-statuses'

export type CreateKeycomboDownOptions = CreateAliasesOptions & {
  toCode?: (alias: string) => KeyStatusCode,
}

const defaultOptions: CreateKeycomboDownOptions = {
  toCode: alias => fromAliasToCode(alias),
}

export const createKeycomboDown = (
  keycombo: string,
  options: CreateKeycomboDownOptions = {},
): KeyStatusFunction<boolean> => {
  const { toLonghand, toCode } = { ...defaultOptions, ...options },
        codes = pipe<string>(
          createAliases({ toLonghand }),
          map<string, KeyStatusCode>(toCode),
        )(keycombo) as KeyStatusCode[]

  return statuses => every<KeyStatusCode>(
    code => createValue(
      code,
      { predicateKey: createCode(code) }
    )(statuses) === 'down'
  )(codes) as boolean
}

