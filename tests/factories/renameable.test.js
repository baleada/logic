import test from 'ava'
import renameable from '../../src/factories/renameable'

test.beforeEach(t => {
  t.context.setup = () => renameable([['one', 'value'], ['two', 'value']])
})

test('rename({ from, to }) renames "from" name to "to" name', t => {
  const instance = t.context.setup(),
        result = instance.rename({ from: 'one', to: 'uno' })

  t.deepEqual(new Map(result), new Map([['uno', 'value'], ['two', 'value']]))
})

test('rename(...) returns renameable', t => {
  const instance = t.context.setup(),
        result = instance.rename({ from: 'one', to: 'uno' })

  t.assert(typeof result.rename === 'function')
})
