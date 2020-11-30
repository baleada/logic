import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { replaceable } from '../fixtures/TEST_BUNDLE.js'

const suite = createSuite('replaceable (node)')

suite.before.each(context => {
  context.setup = () => replaceable(['tortilla', 'frijoles', 'mantequilla', 'aguacate', 'huevito'])
})

suite('replace({ item, index }) replaces the item at index with a new item', context => {
  const instance = context.setup(),
        result = instance.replace({ item: 'baleada' ,index: 2 })

  assert.equal([...result], ['tortilla', 'frijoles', 'baleada', 'aguacate', 'huevito'])
})

suite('replace(...) returns replaceable', context => {
  const instance = context.setup(),
        result = instance.replace({ item: 'baleada', index: 2 })

  assert.ok(typeof result.replace === 'function')
})

suite.run()
