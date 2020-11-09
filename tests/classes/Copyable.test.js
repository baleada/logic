import test from 'ava'
import { Copyable } from '../../lib/index.esm.js'

console.log('WARNING: Copyable requires browser testing')

test.beforeEach(t => {
  t.context.setup = (options = {}) => new Copyable(
    'Baleada: a toolkit for building web apps',
    options
  )
})

/* Basic */
test('stores the string', t => {
  const instance = t.context.setup()

  t.is(instance.string, 'Baleada: a toolkit for building web apps')
})

test('assignment sets the string', t => {
  const instance = t.context.setup()
  instance.string = 'Baleada'

  t.is(instance.string, 'Baleada')
})

test('setString sets the string', t => {
  const instance = t.context.setup()
  instance.setString('Baleada')

  t.is(instance.string, 'Baleada')
})

/* status */
test('status is "ready" after construction', t => {
  const instance = t.context.setup()

  t.is(instance.status, 'ready')
})


/* INFORMAL */

// copy
// copy({ usesFallback: true })

// status is "copying" after copy(...) is called and before the promise resolves
// status is "copied" after copy(...) is called after the promise resolves
