import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
// import { clampable } from '../../lib/index.js'
import clampable from '../../src/factories/clampable.js'

const suite = createSuite('clampable (node)')

suite.before.each(context => {
  context.setup = () => clampable(42)
})

suite('clampable({ min, max }) handles number between min and max', context => {
  const instance = context.setup(),
        result = instance.clamp({ min: 0, max: 100 }).number

  assert.is(result, 42)
})

suite('clampable({ min, max }) handles number below min', context => {
  const instance = context.setup(),
        result = instance.clamp({ min: 50, max: 100 }).number

  assert.is(result, 50)
})

suite('clampable({ min, max }) handles number above max', context => {
  const instance = context.setup(),
        result = instance.clamp({ min: 0, max: 36 }).number

  assert.is(result, 36)
})

suite.run()