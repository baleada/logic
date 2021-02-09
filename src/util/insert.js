import array from '../factories/array.js'
import get from './get.js'
import set from './set.js'

export default function insert ({ object, path, value, index }) {
  const inserted = array(get({ object, path }))
          .insert({ item: value, index })
          .normalize()
  set({ object, path, value: inserted })
}
