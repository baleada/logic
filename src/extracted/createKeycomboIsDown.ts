import { every } from 'lazy-collections'
import type { KeycomboItem } from './keycombo'

export type KeyStatuses = { [name: KeycomboItem['name']]: KeyStatus }

export type KeyStatus = 'down' | 'up'

export type KeyStatusFunction<Returned> = (statuses: KeyStatuses) => Returned

export const createPredicateKeycomboDown = (keycombo: KeycomboItem[]): KeyStatusFunction<boolean> => {
  return statuses => {
    return every<KeycomboItem>(
      ({ name }) => statuses[name] === 'down'
    )(keycombo) as boolean
  }
}



