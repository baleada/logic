import test from 'ava'
import replaceable from '../../src/factories/replaceable'

test.beforeEach(t => {
  t.context.setup = () => replaceable(['tortilla', 'frijoles', 'mantequilla', 'aguacate', 'huevito'])
})

test('replace({ item, index }) replaces the item at index with a new item', t => {
  const instance = t.context.setup(),
        result = instance.replace({ item: 'baleada' ,index: 2 })

  t.deepEqual([...result], ['tortilla', 'frijoles', 'baleada', 'aguacate', 'huevito'])
})

test('replace(...) returns replaceable', t => {
  const instance = t.context.setup(),
        result = instance.replace({ item: 'baleada', index: 2 })

  t.assert(typeof result.replace === 'function')
})
