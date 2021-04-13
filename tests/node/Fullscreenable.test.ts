import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { Fullscreenable } from '../../src/classes/Fullscreenable'

const suite = createSuite('Fullscreenable (node)')

const elementStub = {}

suite.before.each(context => {
  context.setup = (options = {}) => new Fullscreenable(
    () => elementStub,
    options
  )
})

suite('stores the getElement', context => {
  const instance = context.setup()

  assert.ok(instance.getElement instanceof Function)
})

suite('assignment sets the getElement', context => {
  const instance = context.setup()
  instance.getElement = () => 'stub'

  assert.ok(instance.getElement instanceof Function)
})

suite('setGetElement sets the getElement', context => {
  const instance = context.setup()
  instance.setGetElement(() => 'stub')

  assert.ok(instance.getElement instanceof Function)
})

suite('status is "ready" after construction', context => {
  const instance = context.setup()

  assert.is(instance.status, 'ready')
})

suite.run()
