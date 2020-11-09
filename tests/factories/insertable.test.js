import test from 'ava'
import { insertable } from '../../lib/index.esm.js'

test.beforeEach(t => {
  t.context.setup = () => insertable(['tortilla', 'frijoles', 'mantequilla', 'aguacate', 'huevito'])
})

test('insert({ item, index }) inserts the item at index', t => {
  const instance = t.context.setup(),
        result = instance.insert({ item: 'baleada', index: 2 })

  t.deepEqual([...result], ['tortilla', 'frijoles', 'baleada', 'mantequilla', 'aguacate', 'huevito'])
})

test('insert({ items, index }) inserts the items at index', t => {
  const instance = t.context.setup(),
        result = instance.insert({ items: ['baleada', 'toolkit'], index: 2 })

  t.deepEqual([...result], ['tortilla', 'frijoles', 'baleada', 'toolkit', 'mantequilla', 'aguacate', 'huevito'])
})

test('insert(...) returns insertable', t => {
  const instance = t.context.setup(),
        result = instance.insert({ item: 'baleada', index: 2 })

  t.assert(typeof result.insert === 'function')
})
