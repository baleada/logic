import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { Copyable } from '../../lib/index.js'

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


/* INFORMAL */

// copy
// copy({ usesFallback: true })

// status is "copying" after copy(...) is called and before the promise resolves
// status is "copied" after copy(...) is called after the promise resolves

suite.run()
