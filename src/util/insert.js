import { createInsert } from '../pipes/index.js'
import get from './get.js'
import set from './set.js'

export default function insert ({ object, path, value, index }) {
  const inserted = createInsert({ item: value, index })(get({ object, path }))
  
  set({ object, path, value: inserted })
}
