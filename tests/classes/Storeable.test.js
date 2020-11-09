import test from 'ava'
import { Storeable } from '../../lib/index.esm.js'

console.log('WARNING: Storeable requires browser testing')
console.log('WARNING: Storeable is testing a private property')

test.beforeEach(t => {
  t.context.setup = (options = {}) => new Storeable(
    'baleada',
    options
  )
})

test('stores the key', t => {
  const instance = t.context.setup()

  t.is(instance.key, 'baleada')
})

test('assignment sets the key', t => {
  const instance = t.context.setup()
  instance.key = 'toolkit'

  t.is(instance.key, 'toolkit')
})

test('setKey sets the key', t => {
  const instance = t.context.setup()
  instance.setKey('toolkit')

  t.is(instance.key, 'toolkit')
})

test('status is "ready" after construction and before DOM is available', t => {
  const instance = t.context.setup()

  t.is(instance.status, 'ready')
})

test('_computedStatusKey is `${key}_status` by default', t => {
  const instance = t.context.setup()

  t.is(instance._computedStatusKey, 'baleada_status')
})

test('_computedStatusKey respects statusKeySuffix option', t => {
  const instance = t.context.setup({ statusKeySuffix: '-status' })

  t.is(instance._computedStatusKey, 'baleada-status')
})

/* INFORMAL */

// status after DOM is available

// store
// remove
// removeStatus

