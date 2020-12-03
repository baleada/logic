import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { Grantable } from '../../lib/index.js'

const suite = createSuite('Grantable (node)')

suite.before.each(context => {
  context.setup = (options = {}) => new Grantable(
    { name: 'geolocation' },
    options
  )
})

/* Basic */
suite('stores the descriptor', context => {
  const instance = context.setup()

  assert.equal(instance.descriptor, { name: 'geolocation' })
})

suite('assignment sets the descriptor', context => {
  const instance = context.setup()
  instance.descriptor = { name: 'clipboard-write' }

  assert.equal(instance.descriptor, { name: 'clipboard-write' })
})

suite('setDescriptor sets the descriptor', context => {
  const instance = context.setup()
  instance.setDescriptor({ name: 'clipboard-write' })

  assert.equal(instance.descriptor, { name: 'clipboard-write' })
})

/* status */
suite('status is "ready" after construction', context => {
  const instance = context.setup()

  assert.is(instance.status, 'ready')
})

suite.run()
