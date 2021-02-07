import insertableFactory from '../factories/insertable.js'
import get from './get.js'
import set from './set.js'

export default function insert ({ object, path, value, index }) {
  const insertable = insertableFactory(get({ object, path })),
        inserted = insertable.insert({ item: value, index }).value
  set({ object, path, value: inserted })
}
