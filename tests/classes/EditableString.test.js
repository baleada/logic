import test from 'ava'
import Editable from '../../src/classes/Editable'

test.beforeEach(t => {
  t.context.setup = (options = {}) => new Editable('Baleada', {
    type: 'string',
    ...options,
  })
})

/* Getters */
test('editableState is state', t => {
  const instance = t.context.setup()

  t.is(instance.editableState, instance.state)
})

/* Methods */
test('write() emits new state through onEdit', t => {
  const instance = t.context.setup()

  instance.setEditableState('Baleada: a toolkit for building web apps')
  instance.write()

  t.is(instance.state, 'Baleada: a toolkit for building web apps')
})

test('erase() emits empty string through onEdit', t => {
  const instance = t.context.setup()

  instance.erase()

  t.is(instance.state, '')
})
