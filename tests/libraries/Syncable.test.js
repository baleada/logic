import test from 'ava'
import Syncable from '../../src/libraries/Syncable'

test.beforeEach(t => {
  t.context.setup = (options = {}) => new Syncable('Baleada', {
    onSync: (state, instance) => instance.setState(state),
    ...options
  })
})


/* Basic */
test('stores the state', t => {
  const instance = t.context.setup()

  t.is(instance.state, 'Baleada')
})

test('setState sets the state', t => {
  const instance = t.context.setup()
  instance.setState('Baleada: a toolkit for building web apps')

  t.is(instance.state, 'Baleada: a toolkit for building web apps')
})

test('setEditableState sets the editable state', t => {
  const instance = t.context.setup()

  instance.setEditableState('Baleada: a toolkit')

  t.is(instance.editableState, 'Baleada: a toolkit')
})

test('type is hardCodedType when type option is hard-coded', t => {
  const instance = t.context.setup({
    type: 'not string'
  })

  t.is(instance.type, 'not string')
})
