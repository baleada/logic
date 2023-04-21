import { pipe } from 'lazy-collections'
import { createMap } from '../pipes'
import { toCombo } from '../../../logic/src/extracted/toCombo'
import type { ComboItemType } from './fromComboItemNameToType'
import { fromComboItemNameToType } from './fromComboItemNameToType'


// TODO: Abstract to cover click combos?

export type KeycomboItem = {
  name: string,
  type: ComboItemType | 'custom'
}

export function narrowKeycombo (type: string): KeycomboItem[] {
  return pipe(
    toCombo,
    toKeycomboItems
  )(type) as KeycomboItem[]
}

const toKeycomboItems = createMap<
  string,
  KeycomboItem
>(name => ({ name, type: fromComboItemNameToType(name) }))
