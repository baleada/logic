import test from 'ava'
import Editable from '../../src/classes/Editable'

test.beforeEach(t => {
  t.context.setup = (options = {}) => new Editable(
    new Date('2019-04-20'),
    {
      type: 'date',
      ...options
    }
  )
})

/* Getters */
test('editableState is state', t => {
  const instance = t.context.setup()

  t.is(instance.editableState, instance.state)
})

/* Methods */
test('write() emits new state through onEdit', t => {
  const instance = t.context.setup()

  instance.setEditableState(new Date('2019-03-14'))
  instance.write()

  t.deepEqual(instance.state, new Date('2019-03-14'))
})

test('erase() emits current date through onEdit', t => {
  const instance = t.context.setup()

  instance.erase()

  t.deepEqual(instance.state, new Date())
})
