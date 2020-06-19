import test from 'ava'
import exceptable from '../../src/factories/exceptable'

test.beforeEach(t => {
  t.context.setup = () => exceptable({ name: 'baleada', type: 'toolkit', favoriteFood: 'baleada' })
})

test('except({ key }) removes key', t => {
  const instance = t.context.setup(),
        result = instance.except({ key: 'name' })

  t.deepEqual(result, { type: 'toolkit', favoriteFood: 'baleada' })
})

test('except({ keys }) removes keys', t => {
  const instance = t.context.setup(),
        result = instance.except({ keys: ['name', 'type'] })

  t.deepEqual(result, { favoriteFood: 'baleada' })
})

test('except(...) returns exceptable', t => {
  const instance = t.context.setup(),
        result = instance.except({ key: 'name' })

  t.assert(typeof result.except === 'function')
})
