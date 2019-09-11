import test from 'ava'
import Renamable from '../../src/subclasses/Renamable'

test('renameKey(keyToRename, newName) renames keyToRename to newName', t => {
  const instance = new Renamable([['one', 'value'], ['two', 'value']])

  instance.renameKey('one', 'uno')

  t.deepEqual(instance, new Renamable([['uno', 'value'], ['two', 'value']]))
})

test('rename(...) returns Map', t => {
  const instance = new Renamable([['one', 'value'], ['two', 'value']]),
        renamed = instance.renameKey('one', 'uno')

  t.assert(renamed instanceof Map)
})
