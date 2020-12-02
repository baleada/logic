import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { deleteable } from '../../lib/index.js'

const suite = createSuite('deleteable (node)')

suite.before.each(context => {
  context.setup = () => deleteable(['tortilla', 'frijoles', 'mantequilla', 'aguacate', 'huevito'])
})

suite('delete({ index }) removes the item at index from the array', context => {
  const instance = context.setup(),
        result = instance.delete({ index: 2 })

  assert.equal([...result], ['tortilla', 'frijoles', 'aguacate', 'huevito'])
})

suite('delete({ item }) removes item from the array', context => {
  const instance = context.setup(),
        result = instance.delete({ item: 'mantequilla' })

  assert.equal([...result], ['tortilla', 'frijoles', 'aguacate', 'huevito'])
})

suite('delete({ index, item }) ignores item and removes the item at index from the array', context => {
  const instance = context.setup(),
        result = instance.delete({ index: 0, item: 'mantequilla' })

  assert.equal([...result], ['frijoles', 'mantequilla', 'aguacate', 'huevito'])
})

suite('delete(...) returns deleteable', context => {
  const instance = context.setup(),
        result = instance.delete({ index: 2 })

  assert.ok(typeof result.delete === 'function')
})

suite.run()
