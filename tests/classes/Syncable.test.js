import test from 'ava'
import Syncable from '../../src/libraries/Syncable'

test.beforeEach(t => {
  t.context.setup = (options = {}) => new Syncable('Baleada', options)
})

/* Basic */
test('stores the state', t => {
  const instance = t.context.setup({
    type: 'string',
  })

  t.is(instance.state, 'Baleada')
})

test('setState sets the state', t => {
  const instance = t.context.setup({
    type: 'string',
  })
  instance.setState('Baleada: a toolkit for building web apps')

  t.is(instance.state, 'Baleada: a toolkit for building web apps')
})

test('setEditableState sets the editable state', t => {
  const instance = t.context.setup({
    type: 'string',
  })

  instance.setEditableState('Baleada: a toolkit')

  t.is(instance.editableState, 'Baleada: a toolkit')
})

test('type is hardCodedType when type option is hard-coded', t => {
  const instance = t.context.setup({
    type: 'not string'
  })

  t.is(instance.type, 'not string')
})

test('cancel() resets editableState', t => {
  const instance = t.context.setup({
    type: 'string',
  })
  instance.setEditableState('not Baleada')
  instance.cancel()

  t.is(instance.editableState, 'Baleada')
})
