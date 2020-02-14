import test from 'ava'
import insertable from '../../src/factories/insertable'

test.beforeEach(t => {
  t.context.setup = () => insertable(['tortilla', 'frijoles', 'mantequilla', 'aguacate', 'huevito'])
})

test('insert({ item, index }) inserts the item at index', t => {
  const instance = t.context.setup(),
        result = instance.insert({ item: 'baleada', index: 2 })

  t.deepEqual([...result], ['tortilla', 'frijoles', 'baleada', 'mantequilla', 'aguacate', 'huevito'])
})

test('insert(...) returns insertable', t => {
  const instance = t.context.setup(),
        result = instance.insert({ item: 'baleada', index: 2 })

  t.assert(typeof result.insert === 'function')
})
