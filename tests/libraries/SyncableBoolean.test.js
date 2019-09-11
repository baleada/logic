import test from 'ava'
import Syncable from '../../src/libraries/Syncable'

test.beforeEach(t => {
  t.context.setup = (options = {}) => new Syncable(true, {
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
test('write() emits new state through onSync', t => {
  let result
  const instance = t.context.setup({ onSync: newState => (result = newState) })

  instance.setEditableState(false)
  instance.write()

  t.is(result, false)
})

test('erase() emits false through onSync', t => {
  let result
  const instance = t.context.setup({ onSync: newState => (result = newState) })

  instance.erase()

  t.is(result, false)
})
