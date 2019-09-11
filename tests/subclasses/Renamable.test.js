import test from 'ava'
import Renamable from '../../src/subclasses/Renamable'

test.beforeEach(t => {
  t.context.setup = () => new Renamable([['one', 'value'], ['two', 'value']])
})

test('renameKey(keyToRename, newName) renames keyToRename to newName', t => {
  const instance = t.context.setup()

  instance.renameKey('one', 'uno')

  t.deepEqual(instance, new Renamable([['uno', 'value'], ['two', 'value']]))
})

test('rename(...) returns Map', t => {
  const instance = t.context.setup(),
        renamed = instance.renameKey('one', 'uno')

  t.assert(renamed instanceof Map)
})
