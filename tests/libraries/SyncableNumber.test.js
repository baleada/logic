import test from 'ava'
import Syncable from '../../src/libraries/Syncable'

test.beforeEach(t => {
  t.context.setup = (options = {}) => new Syncable(42, {
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
test('write() emits new state through onSync', t => {
  let result
  const instance = t.context.setup({ onSync: newState => (result = newState) })

  instance.setEditableState(420)
  instance.write()

  t.is(result, 420)
})

test('erase() emits 0 through onSync', t => {
  let result
  const instance = t.context.setup({ onSync: newState => (result = newState) })

  instance.erase()

  t.is(result, 0)
})
