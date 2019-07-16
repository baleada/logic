import test from 'ava'
import Syncable from '../../src/libraries/Syncable'
import enumerable from '../fixtures/enumerable.json'

test.beforeEach(t => {
  t.context.setup = (options = {}) => new Syncable('Baleada: a toolkit for building web apps[]', options)
})

/* Basic */
test('enumerables match intended enumerables', t => {
  const instance = t.context.setup()

  t.is(
    enumerable.Syncable.every(key => Object.keys(instance).includes(key)),
    true
  )
})

/* [getter] */

/* [method] */
