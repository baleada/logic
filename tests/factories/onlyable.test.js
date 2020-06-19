import test from 'ava'
import onlyable from '../../src/factories/onlyable'

test.beforeEach(t => {
  t.context.setup = () => onlyable({ name: 'baleada', type: 'toolkit', favoriteFood: 'baleada' })
})

test('only({ key }) only includes key', t => {
  const instance = t.context.setup(),
        result = instance.only({ key: 'name' })

  t.deepEqual(result, { name: 'baleada' })
})

test('only({ keys }) only includes keys', t => {
  const instance = t.context.setup(),
        result = instance.only({ keys: ['name', 'type'] })

  t.deepEqual(result, { name: 'baleada', type: 'toolkit' })
})

test('only(...) returns onlyable', t => {
  const instance = t.context.setup(),
        result = instance.only({ key: 'name' })

  t.assert(typeof result.only === 'function')
})
