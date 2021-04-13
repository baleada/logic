import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { Copyable } from '../../src/classes/Copyable'

const suite = createSuite('Copyable (node)')

suite.before.each(context => {
  context.setup = (options = {}) => new Copyable(
    'Baleada: a toolkit for building web apps',
    options
  )
})

/* Basic */
suite('stores the string', context => {
  const instance = context.setup()

  assert.is(instance.string, 'Baleada: a toolkit for building web apps')
})

suite('assignment sets the string', context => {
  const instance = context.setup()
  instance.string = 'Baleada'

  assert.is(instance.string, 'Baleada')
})

suite('setString sets the string', context => {
  const instance = context.setup()
  instance.setString('Baleada')

  assert.is(instance.string, 'Baleada')
})

/* status */
suite('status is "ready" after construction', context => {
  const instance = context.setup()

  assert.is(instance.status, 'ready')
})

suite.run()
