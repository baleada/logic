import test from 'ava'
import Syncable from '../../src/libraries/Syncable'

test.beforeEach(t => {
  t.context.setup = (options = {}) => new Syncable('Baleada: a toolkit for building web apps', {
    onSync: (state, instance) => t.context.newInstance = instance.set(state),
    ...options
  })
})

/* Basic */

/* [getter] */

/* [method] */
