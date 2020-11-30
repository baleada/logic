import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { reorderable } from '../fixtures/TEST_BUNDLE.js'

const suite = createSuite('reorderable (node)')

suite.before.each(context => {
  context.setup = () => reorderable(['tortilla', 'frijoles', 'mantequilla', 'aguacate', 'huevito'])
})

suite('reorder({ from: index, to: index }) moves `from` index forward to `to` index', context => {
  const instance = context.setup(),
        result = instance.reorder({ from: 1, to: 3 })

  assert.equal([...result], ['tortilla', 'mantequilla', 'aguacate', 'frijoles', 'huevito'])
})

suite('reorder({ from: index, to: index }) moves `from` index backward to `to` index', context => {
  const instance = context.setup(),
        result = instance.reorder({ from: 3, to: 1 })

  assert.equal([...result], ['tortilla', 'aguacate', 'frijoles', 'mantequilla', 'huevito'])
})

suite('reorder({ from: { start, itemCount = 1 }, to: index }) moves item from `start` forward to `to` index', context => {
  const instance = context.setup(),
        result = instance.reorder({
          from: { start: 0, itemCount: 1 },
          to: 1
        })

  assert.equal([...result], ['frijoles', 'tortilla', 'mantequilla', 'aguacate', 'huevito'])
})

suite('reorder({ from: { start, itemCount != 0 }, to: index }) moves `itemCount` items from `start` to `to` index', context => {
  const instance = context.setup(),
        result = instance.reorder({
          from: { start: 0, itemCount: 2 },
          to: 2
        })

  assert.equal([...result], ['mantequilla', 'tortilla', 'frijoles', 'aguacate', 'huevito'])
})

suite('reorder(...) returns reorderable', context => {
  const instance = context.setup(),
        result = instance.reorder({ from: 0, to: 1 })

  assert.ok(typeof result.reorder === 'function')
})

suite.run()
