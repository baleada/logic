import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { uniqueable } from '../fixtures/TEST_BUNDLE.js'

const suite = createSuite('uniqueable (node)')

suite.before.each(context => {
  context.setup = () => uniqueable(['baleada', 'baleada', 'toolkit', 'toolkit'])
})

suite('unique() removes duplicates', context => {
  const instance = context.setup(),
        result = instance.unique()

  assert.equal([...result], ['baleada', 'toolkit'])
})

suite('unique(...) returns uniqueable', context => {
  const instance = context.setup(),
        result = instance.unique()

  assert.ok(typeof result.unique === 'function')
})

suite.run()
