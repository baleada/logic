import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import number from '../../src/factories/number.js'

const suite = createSuite('clampable (node)')

suite.before.each(context => {
  context.setup = () => number(42)
})

suite(`normalizes`, context => {
  const instance = context.setup(),
        value = instance.normalize()

  assert.is(value, 42)
})

suite(`clamp({ min, max }) handles number between min and max`, context => {
  const instance = context.setup(),
        value = instance.clamp({ min: 0, max: 100 }).normalize()

  assert.is(value, 42)
})

suite(`clamp({ min, max }) handles number below min`, context => {
  const instance = context.setup(),
        value = instance.clamp({ min: 50, max: 100 }).normalize()

  assert.is(value, 50)
})

suite(`clamp({ min, max }) handles number above max`, context => {
  const instance = context.setup(),
        value = instance.clamp({ min: 0, max: 36 }).normalize()

  assert.is(value, 36)
})

suite.run()
