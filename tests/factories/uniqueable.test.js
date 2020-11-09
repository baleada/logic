import test from 'ava'
import { uniqueable } from '../../lib/index.esm.js'

test.beforeEach(t => {
  t.context.setup = () => uniqueable(['baleada', 'baleada', 'toolkit', 'toolkit'])
})

test('unique() removes duplicates', t => {
  const instance = t.context.setup(),
        result = instance.unique()

  t.deepEqual([...result], ['baleada', 'toolkit'])
})

test('unique(...) returns uniqueable', t => {
  const instance = t.context.setup(),
        result = instance.unique()

  t.assert(typeof result.unique === 'function')
})
