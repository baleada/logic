import test from 'ava'
import reorderable from '../../src/factories/reorderable'

test.beforeEach(t => {
  t.context.setup = () => reorderable(['tortilla', 'frijoles', 'mantequilla', 'aguacate', 'huevito'])
})

test('reorder(itemToMove, itemDestination) moves itemToMove to itemDestination', t => {
  const instance = t.context.setup(),
        result = instance.reorder(0, 1)

  t.deepEqual([...result], ['frijoles', 'tortilla', 'mantequilla', 'aguacate', 'huevito'])
})

test('reorder({ start, itemCount = 0 }, itemDestination) moves item from `start` to itemDestination', t => {
  const instance = t.context.setup(),
        result = instance.reorder(
          { start: 0, itemCount: 1 },
          1
        )

  t.deepEqual([...result], ['frijoles', 'tortilla', 'mantequilla', 'aguacate', 'huevito'])
})

test('reorder({ start, itemCount != 0 }, itemDestination) moves itemCount items from `start` to itemDestination', t => {
  const instance = t.context.setup(),
        result = instance.reorder(
          { start: 0, itemCount: 2 },
          2
        )

  t.deepEqual([...result], ['mantequilla', 'tortilla', 'frijoles', 'aguacate', 'huevito'])
})

test('reorder(...) returns reorderable', t => {
  const instance = t.context.setup(),
        result = instance.reorder(0, 1)

  t.assert(typeof result.reorder === 'function')
})
