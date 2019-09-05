import test from 'ava'
import Syncable from '../../src/libraries/Syncable'

test.beforeEach(t => {
  t.context.setup = (options = {}) => new Syncable(
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
test('write({ key, oldKey, value }) emits new state with oldKey deleted and new key set to value through onSync', t => {
  let value
  const instance = t.context.setup({
    onSync: newState => (value = newState)
  })

  const options = {
    key: 'newName',
    oldKey: 'name',
    value: 'Baleada Logic',
  }
  instance.write(options)

  t.deepEqual(value, new Map([['newName', 'Baleada Logic'], ['description', 'A toolkit for building web apps']]))
})

test('write({ key, oldKey }) emits new state with oldKey renamed to key through onSync', t => {
  let value
  const instance = t.context.setup({
    onSync: newState => (value = newState)
  })

  const options = {
    key: 'newName',
    oldKey: 'name',
  }
  instance.write(options)

  t.deepEqual(value, new Map([['newName', 'Baleada'], ['description', 'A toolkit for building web apps']]))
})

test('write({ key, value }) emits new state with key set to value through onSync', t => {
  let value
  const instance = t.context.setup({
    onSync: newState => (value = newState)
  })

  const options = {
    key: 'newName',
    value: 'Baleada Logic',
  }
  instance.write(options)

  t.deepEqual(value, new Map([['name', 'Baleada'], ['description', 'A toolkit for building web apps'], ['newName', 'Baleada Logic']]))
})

// test('erase({ value }) emits new state with value set to undefined deleted through onSync', t => {
//   let value
//   const instance = t.context.setup({
//     onSync: newState => (value = newState)
//   })
//
//   instance.erase({ value: 'A toolkit for building web apps' })
//
//   t.deepEqual(value, { name: 'Baleada', description: undefined })
// })
//
// test('erase({ key }) emits new state with key deleted through onSync', t => {
//   let value
//   const instance = t.context.setup({
//     onSync: newState => (value = newState)
//   })
//
//   instance.erase({ key: 'description' })
//
//   t.deepEqual(value, { name: 'Baleada' })
// })
//
// test('erase({ last }) emits new state with last key deleted through onSync', t => {
//   let value
//   const instance = t.context.setup({
//     onSync: newState => (value = newState)
//   })
//
//   instance.erase({ last: true })
//
//   t.deepEqual(value, { name: 'Baleada' })
// })
//
// test('erase({ all }) emits new state with all keys deleted through onSync', t => {
//   let value
//   const instance = t.context.setup({
//     onSync: newState => (value = newState)
//   })
//
//   instance.erase({ all: true })
//
//   t.deepEqual(value, {})
// })
