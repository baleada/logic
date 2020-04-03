import test from 'ava'
import Storeable from '../../src/classes/Storeable'

console.log('WARNING: Storeable requires informal testing')

test.beforeEach(t => {
  t.context.setup = (options = {}) => new Storeable(
    'stub',
    options
  )
})

test('stores the key', t => {
  const instance = t.context.setup()

  t.is(instance.key, 'stub')
})

test('assignment sets the key', t => {
  const instance = t.context.setup()
  instance.key = 'example'

  t.is(instance.key, 'example')
})

test('setKey sets the key', t => {
  const instance = t.context.setup()
  instance.setKey('example')

  t.is(instance.key, 'example')
})

test('status is "ready" after construction and before DOM is available', t => {
  const instance = t.context.setup()

  t.is(instance.status, 'ready')
})

/* INFORMAL */

// status after DOM is available

// store
// remove
// removeStatus

