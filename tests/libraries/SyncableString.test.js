import test from 'ava'
import Syncable from '../../src/libraries/Syncable'

test.beforeEach(t => {
  t.context.setup = (options = {}) => new Syncable('Baleada', {
    type: 'string',
    ...options,
  })
})

/* Getters */
test('editableState is state', t => {
  const instance = t.context.setup()

  t.is(instance.editableState, instance.state)
})

test('editableState is state when editsFullState is true', t => {
  const instance = t.context.setup({
    editsFullState: true
  })

  t.is(instance.editableState, instance.state)
})


test('type', t => {
  const instance = t.context.setup()
  t.is(instance.type, 'string')
})


/* Methods */
test('write() emits new state through onSync', t => {
  let value
  const instance = t.context.setup({
    onSync: newState => value = newState
  })

  instance.setEditableState('Baleada: a toolkit for building web apps')
  instance.write()

  t.is(value, 'Baleada: a toolkit for building web apps')
})

test('erase() emits empty string through onSync', t => {
  let value
  const instance = t.context.setup({
    onSync: newState => value = newState
  })

  instance.erase()

  t.is(value, '')
})
