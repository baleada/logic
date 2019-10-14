import test from 'ava'
import Renamable from '../../src/subclasses/Renamable'

test.beforeEach(t => {
  t.context.setup = () => new Renamable([['one', 'value'], ['two', 'value']])
})

test('renameKey(keyToRename, newName) renames keyToRename to newName', t => {
  const instance = t.context.setup(),
        result = instance.renameKey('one', 'uno')

  t.deepEqual(result, new Renamable([['uno', 'value'], ['two', 'value']]))
})

test('rename(...) returns Renamable', t => {
  const instance = t.context.setup(),
        result = instance.renameKey('one', 'uno')

  t.assert(result instanceof Renamable)
})
