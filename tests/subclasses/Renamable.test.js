import test from 'ava'
import Renamable from '../../src/subclasses/Renamable'

test('renameKey(keyToRename, newName) returns map with keyToRename renamed to newName', t => {
  const instance = new Renamable([['one', 'value'], ['two', 'value']]),
        renamed = instance.renameKey('one', 'uno')

  t.deepEqual(renamed, new Map([['uno', 'value'], ['two', 'value']]))
})
