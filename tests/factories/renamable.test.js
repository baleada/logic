import test from 'ava'
import renamable from '../../src/factories/renamable'

test.beforeEach(t => {
  t.context.setup = () => renamable([['one', 'value'], ['two', 'value']])
})

test('rename(key, newName) renames key to newName', t => {
  const instance = t.context.setup(),
        result = instance.rename('one', 'uno')

  t.deepEqual(new Map(result), new Map([['uno', 'value'], ['two', 'value']]))
})

test('rename(...) returns renamable', t => {
  const instance = t.context.setup(),
        result = instance.rename('one', 'uno')

  t.assert(typeof result.rename === 'function')
})
