import test from 'ava'
import Editable from '../../src/classes/Editable'

test.beforeEach(t => {
  t.context.setup = (options = {}) => new Editable(42, {
    type: 'number',
    ...options
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

  instance.setEditableState(420)
  instance.write()

  t.is(instance.state, 420)
})

test('erase() emits 0 through onEdit', t => {
  const instance = t.context.setup()

  instance.erase()

  t.is(instance.state, 0)
})
