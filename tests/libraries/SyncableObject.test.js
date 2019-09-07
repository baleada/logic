import test from 'ava'
import Syncable from '../../src/libraries/Syncable'

test.beforeEach(t => {
  t.context.setup = (options = {}) => new Syncable(
    {
      name: 'Baleada',
      description: 'A toolkit for building web apps',
    },
    {
      type: 'object',
      ...options,
    }
  )
})

/* Getters */
test('editableState is state', t => {
  const instance = t.context.setup()

  t.is(instance.editableState, instance.state)
})

/* Methods */
test('write({ key, rename, value }) emits new state with rename deleted and new key set to value through onSync', t => {
  let value
  const instance = t.context.setup({
    onSync: newState => (value = newState)
  })

  instance.write({
    key: 'newName',
    rename: 'name',
    value: 'Baleada Logic',
  })

  t.deepEqual(value, { newName: 'Baleada Logic', description: 'A toolkit for building web apps' })
})

test('write({ key, rename }) emits new state with rename renamed to key through onSync', t => {
  let value
  const instance = t.context.setup({
    onSync: newState => (value = newState)
  })

  instance.write({
    key: 'newName',
    rename: 'name',
  })

  t.deepEqual(value, { newName: 'Baleada', description: 'A toolkit for building web apps' })
})

test('write({ key, value }) emits new state with key set to value through onSync', t => {
  let value
  const instance = t.context.setup({
    onSync: newState => (value = newState)
  })

  instance.write({
    key: 'newName',
    value: 'Baleada Logic',
  })

  t.deepEqual(value, { name: 'Baleada', newName: 'Baleada Logic', description: 'A toolkit for building web apps' })
})

test('erase({ key }) emits new state with key deleted through onSync', t => {
  let value
  const instance = t.context.setup({
    onSync: newState => (value = newState)
  })

  instance.erase({ key: 'description' })

  t.deepEqual(value, { name: 'Baleada' })
})

test('erase({ last }) emits new state with last key deleted through onSync', t => {
  let value
  const instance = t.context.setup({
    onSync: newState => (value = newState)
  })

  instance.erase({ last: true })

  t.deepEqual(value, { name: 'Baleada' })
})

test('erase({ all }) emits new state with all keys deleted through onSync', t => {
  let value
  const instance = t.context.setup({
    onSync: newState => (value = newState)
  })

  instance.erase({ all: true })

  t.deepEqual(value, {})
})
