import test from 'ava'
import Reorderable from '../../src/subclasses/Reorderable'

test.beforeEach(t => {
  t.context.setup = () => new Reorderable('tortilla', 'frijoles', 'mantequilla', 'aguacate', 'huevito')
})

test('reorder(itemToMove, itemDestination) moves itemToMove to itemDestination', t => {
  const instance = t.context.setup(),
        result = instance.reorder(0, 1)

  t.deepEqual(result, new Reorderable('frijoles', 'tortilla', 'mantequilla', 'aguacate', 'huevito'))
})

test('reorder({ start, itemCount = 0 }, itemDestination) moves item from `start` to itemDestination', t => {
  const instance = t.context.setup(),
        result = instance.reorder(
          { start: 0, itemCount: 1 },
          1
        )

  t.deepEqual(result, new Reorderable('frijoles', 'tortilla', 'mantequilla', 'aguacate', 'huevito'))
})

test('reorder({ start, itemCount != 0 }, itemDestination) moves itemCount items from `start` to itemDestination', t => {
  const instance = t.context.setup(),
        result = instance.reorder(
          { start: 0, itemCount: 2 },
          2
        )

  t.deepEqual(result, new Reorderable('mantequilla', 'tortilla', 'frijoles', 'aguacate', 'huevito'))
})

test('reorder(...) returns Reorderable', t => {
  const instance = t.context.setup(),
        result = instance.reorder(0, 1)

  t.assert(result instanceof Reorderable)
})
