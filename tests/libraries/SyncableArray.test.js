import test from 'ava'
import Syncable from '../../src/libraries/Syncable'

test.beforeEach(t => {
  t.context.setup = (options = {}) => new Syncable(
    ['tortilla', 'frijoles', 'mantequilla', 'aguacate', 'huevito'],
    {
      type: 'array',
      ...options,
    }
  )
})

/* Getters */
test('editableState is state', t => {
  const instance = t.context.setup()

  t.deepEqual(instance.editableState, instance.state)
})

test('editableState is an empty string when editsFullArray is false', t => {
  const instance = t.context.setup({
    editsFullArray: false,
  })

  t.is(instance.editableState, '')
})

/* Methods */
test('write() emits editableState through onSync', t => {
  let result
  const instance = t.context.setup({
    onSync: newState => (result = newState)
  })
  instance.setEditableState(['Baleada'])
  instance.write()

  t.deepEqual(result, ['Baleada'])
})

test('write() concats editableState and emits through onSync when editsFullArray is false', t => {
  let result
  const instance = t.context.setup({
    onSync: newState => (result = newState),
    editsFullArray: false,
  })

  instance.setEditableState('Baleada')
  instance.write()

  t.deepEqual(result, ['tortilla', 'frijoles', 'mantequilla', 'aguacate', 'huevito', 'Baleada'])
})

test('erase({ value }) emits new state with value deleted through onSync', t => {
  let result
  const instance = t.context.setup({
    onSync: newState => (result = newState)
  })

  instance.erase({ value: 'tortilla' })

  t.deepEqual(result, ['frijoles', 'mantequilla', 'aguacate', 'huevito'])
})

test('erase({ last }) emits new state with last item deleted through onSync', t => {
  let result
  const instance = t.context.setup({
    onSync: newState => (result = newState)
  })

  instance.erase({ last: true })

  t.deepEqual(result, ['tortilla', 'frijoles', 'mantequilla', 'aguacate'])
})

test('erase({ all }) emits new state with all values deleted through onSync', t => {
  let result
  const instance = t.context.setup({
    onSync: newState => (result = newState)
  })

  instance.erase({ all: true })

  t.deepEqual(result, [])
})
