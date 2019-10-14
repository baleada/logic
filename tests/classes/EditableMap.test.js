import test from 'ava'
import Editable from '../../src/classes/Editable'

test.beforeEach(t => {
  t.context.setup = (options = {}) => new Editable(
    new Map([
      ['name', 'Baleada'],
      ['description', 'A toolkit for building web apps'],
    ]),
    {
      type: 'map',
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
test('write({ key, rename, value }) emits new state with rename deleted and new key set to value through onEdit', t => {
  const instance = t.context.setup()

  instance.write({
    key: 'newName',
    rename: 'name',
    value: 'Baleada Logic',
  })

  t.deepEqual(instance.state, new Map([['newName', 'Baleada Logic'], ['description', 'A toolkit for building web apps']]))
})

test('write({ key, rename }) emits new state with rename renamed to key through onEdit', t => {
  const instance = t.context.setup()

  instance.write({
    key: 'newName',
    rename: 'name',
  })

  t.deepEqual(instance.state, new Map([['newName', 'Baleada'], ['description', 'A toolkit for building web apps']]))
})

test('write({ key, value }) emits new state with key set to value through onEdit', t => {
  const instance = t.context.setup()

  instance.write({
    key: 'newName',
    value: 'Baleada Logic',
  })

  t.deepEqual(instance.state, new Map([['name', 'Baleada'], ['description', 'A toolkit for building web apps'], ['newName', 'Baleada Logic']]))
})

test('erase({ key }) emits new state with key deleted through onEdit', t => {
  const instance = t.context.setup()

  instance.erase({ key: 'description' })

  t.deepEqual(instance.state, new Map([
    ['name', 'Baleada']
  ]))
})

test('erase({ last }) emits new state with last key deleted through onEdit', t => {
  const instance = t.context.setup()

  instance.erase({ last: true })

  t.deepEqual(instance.state, new Map([['name', 'Baleada']]))
})

test('erase({ all }) emits new state with all keys deleted through onEdit', t => {
  const instance = t.context.setup()

  instance.erase({ all: true })

  t.deepEqual(instance.state, new Map())
})
