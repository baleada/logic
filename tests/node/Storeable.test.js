import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { Storeable } from '../fixtures/TEST_BUNDLE.js'

console.log('WARNING: Storeable requires browser testing')
console.log('WARNING: Storeable is testing a private property')

const suite = createSuite('Storeable (node)')

suite.before.each(context => {
  context.setup = (options = {}) => new Storeable(
    'baleada',
    options
  )
})

suite('stores the key', context => {
  const instance = context.setup()

  assert.is(instance.key, 'baleada')
})

suite('assignment sets the key', context => {
  const instance = context.setup()
  instance.key = 'toolkit'

  assert.is(instance.key, 'toolkit')
})

suite('setKey sets the key', context => {
  const instance = context.setup()
  instance.setKey('toolkit')

  assert.is(instance.key, 'toolkit')
})

suite('status is "ready" after construction and before DOM is available', context => {
  const instance = context.setup()

  assert.is(instance.status, 'ready')
})

suite('_computedStatusKey is `${key}_status` by default', context => {
  const instance = context.setup()

  assert.is(instance._computedStatusKey, 'baleada_status')
})

suite('_computedStatusKey respects statusKeySuffix option', context => {
  const instance = context.setup({ statusKeySuffix: '-status' })

  assert.is(instance._computedStatusKey, 'baleada-status')
})

/* INFORMAL */

// status after DOM is available

// store
// remove
// removeStatus

suite.run()
