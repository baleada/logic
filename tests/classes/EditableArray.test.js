import test from 'ava'
import Editable from '../../src/classes/Editable'

test.beforeEach(t => {
  t.context.setup = (options = {}) => new Editable(
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

/* Methods */
test('write() emits editableState through onEdit', t => {
  const instance = t.context.setup()
  instance.setEditableState(['Baleada'])
  instance.write()

  t.deepEqual(instance.state, ['Baleada'])
})

test('write({ item: (any) }) concats editableState and emits through onEdit', t => {
  const instance = t.context.setup()

  instance.write({ item: 'Baleada' })

  t.deepEqual(instance.state, ['tortilla', 'frijoles', 'mantequilla', 'aguacate', 'huevito', 'Baleada'])
})

test('erase({ item: (String) }) emits new state with item deleted through onEdit', t => {
  const instance = t.context.setup()

  instance.erase({ item: 'tortilla' })

  t.deepEqual(instance.state, ['frijoles', 'mantequilla', 'aguacate', 'huevito'])
})

test('erase({ item: (Function) }) emits new state with item deleted through onEdit', t => {
  const instance = t.context.setup()

  instance.erase({ item: currentItem => currentItem === 'tortilla' })

  t.deepEqual(instance.state, ['frijoles', 'mantequilla', 'aguacate', 'huevito'])
})

test('erase({ last }) emits new state with last item deleted through onEdit', t => {
  const instance = t.context.setup()

  instance.erase({ last: true })

  t.deepEqual(instance.state, ['tortilla', 'frijoles', 'mantequilla', 'aguacate'])
})

test('erase({ all }) emits new state with all values deleted through onEdit', t => {
  const instance = t.context.setup()

  instance.erase({ all: true })

  t.deepEqual(instance.state, [])
})
