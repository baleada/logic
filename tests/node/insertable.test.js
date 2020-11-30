import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { insertable } from '../fixtures/TEST_BUNDLE.js'

const suite = createSuite('insertable (node)')

suite.before.each(context => {
  context.setup = () => insertable(['tortilla', 'frijoles', 'mantequilla', 'aguacate', 'huevito'])
})

suite('insert({ item, index }) inserts the item at index', context => {
  const instance = context.setup(),
        result = instance.insert({ item: 'baleada', index: 2 })

  assert.equal([...result], ['tortilla', 'frijoles', 'baleada', 'mantequilla', 'aguacate', 'huevito'])
})

suite('insert({ items, index }) inserts the items at index', context => {
  const instance = context.setup(),
        result = instance.insert({ items: ['baleada', 'toolkit'], index: 2 })

  assert.equal([...result], ['tortilla', 'frijoles', 'baleada', 'toolkit', 'mantequilla', 'aguacate', 'huevito'])
})

suite('insert(...) returns insertable', context => {
  const instance = context.setup(),
        result = instance.insert({ item: 'baleada', index: 2 })

  assert.ok(typeof result.insert === 'function')
})

suite.run()
