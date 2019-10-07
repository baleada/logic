import test from 'ava'
import Syncable from '../../src/libraries/Syncable'

test.beforeEach(t => {
  t.context.setup = (options = {}) => new Syncable(
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
test('write() emits new state through onSync', t => {
  let result
  const instance = t.context.setup({
    onSync: newState => (result = newState)
  })

  instance.setEditableState(new Date('2019-03-14'))
  instance.write()

  t.deepEqual(result, new Date('2019-03-14'))
})

test('erase() emits current date through onSync', t => {
  let result
  const instance = t.context.setup({
    onSync: newState => (result = newState)
  })

  instance.erase()

  t.deepEqual(result, new Date())
})
