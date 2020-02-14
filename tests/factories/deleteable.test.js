import test from 'ava'
import deleteable from '../../src/factories/deleteable'

test.beforeEach(t => {
  t.context.setup = () => deleteable(['tortilla', 'frijoles', 'mantequilla', 'aguacate', 'huevito'])
})

test('delete({ index }) removes the item at index from the array', t => {
  const instance = t.context.setup(),
        result = instance.delete({ index: 2 })

  t.deepEqual([...result], ['tortilla', 'frijoles', 'aguacate', 'huevito'])
})

test('delete({ item }) removes item from the array', t => {
  const instance = t.context.setup(),
        result = instance.delete({ item: 'mantequilla' })

  t.deepEqual([...result], ['tortilla', 'frijoles', 'aguacate', 'huevito'])
})

test('delete(...) returns deleteable', t => {
  const instance = t.context.setup(),
        result = instance.delete({ index: 2 })

  t.assert(typeof result.delete === 'function')
})
