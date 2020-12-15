import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { Dispatchable } from '../../lib/index.js'

const suite = createSuite('Dispatchable (node)')

suite.before.each(context => {
  context.setup = (options = {}) => new Dispatchable(
    'cmd+b',
    options
  )
})

suite('stores the type', context => {
  const instance = context.setup()

  assert.equal(instance.type, 'cmd+b')
})

suite('assignment sets the type', context => {
  const instance = context.setup()
  instance.type = 'shift+cmd+b'

  assert.equal(instance.type, 'shift+cmd+b')
})

suite('setType sets the type', context => {
  const instance = context.setup()
  instance.setType('shift+cmd+b')

  assert.equal(instance.type, 'shift+cmd+b')
})

/* status */
suite('status is "ready" after construction', context => {
  const instance = context.setup()

  assert.is(instance.status, 'ready')
})

suite.run()
