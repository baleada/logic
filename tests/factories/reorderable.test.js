import test from 'ava'
import reorderable from '../../src/factories/reorderable'

test.beforeEach(t => {
  t.context.setup = () => reorderable(['tortilla', 'frijoles', 'mantequilla', 'aguacate', 'huevito'])
})

test('reorder({ from: index, to: index }) moves `from` index forward to `to` index', t => {
  const instance = t.context.setup(),
        result = instance.reorder({ from: 1, to: 3 })

  t.deepEqual([...result], ['tortilla', 'mantequilla', 'aguacate', 'frijoles', 'huevito'])
})

test('reorder({ from: index, to: index }) moves `from` index backward to `to` index', t => {
  const instance = t.context.setup(),
        result = instance.reorder({ from: 3, to: 1 })

  t.deepEqual([...result], ['tortilla', 'aguacate', 'frijoles', 'mantequilla', 'huevito'])
})

test('reorder({ from: { start, itemCount = 1 }, to: index }) moves item from `start` forward to `to` index', t => {
  const instance = t.context.setup(),
        result = instance.reorder({
          from: { start: 0, itemCount: 1 },
          to: 1
        })

  t.deepEqual([...result], ['frijoles', 'tortilla', 'mantequilla', 'aguacate', 'huevito'])
})

test('reorder({ from: { start, itemCount != 0 }, to: index }) moves `itemCount` items from `start` to `to` index', t => {
  const instance = t.context.setup(),
        result = instance.reorder({
          from: { start: 0, itemCount: 2 },
          to: 2
        })

  t.deepEqual([...result], ['mantequilla', 'tortilla', 'frijoles', 'aguacate', 'huevito'])
})

test('reorder(...) returns reorderable', t => {
  const instance = t.context.setup(),
        result = instance.reorder({ from: 0, to: 1 })

  t.assert(typeof result.reorder === 'function')
})
