import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import map from '../../src/factories/map.js'

const suite = createSuite('map (node)')

suite.before.each(context => {
  context.setup = () => map(new Map([['one', 'value'], ['two', 'value']]))
})

suite(`normalizes`, context => {
  const instance = context.setup(),
        value = instance.normalize()

  assert.equal(value, new Map([['one', 'value'], ['two', 'value']]))
})

suite('rename({ from, to }) renames "from" name to "to" name', context => {
  const instance = context.setup(),
        result = instance.rename({ from: 'one', to: 'uno' }).normalize()

  assert.equal(result, new Map([['uno', 'value'], ['two', 'value']]))
})

suite.run()
