import test from 'ava'
import Editable from '../../src/classes/Editable'

test.beforeEach(t => {
  t.context.setup = (options = {}) => new Editable(true, {
    type: 'boolean',
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

  instance.setEditableState(false)
  instance.write()

  t.is(instance.state, false)
})

test('erase() emits false through onEdit', t => {
  const instance = t.context.setup()

  instance.erase()

  t.is(instance.state, false)
})
