import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { uniqueable } from '../../lib/index.js'

const suite = createSuite('uniqueable (node)')

suite.before.each(context => {
  context.setup = () => uniqueable(['baleada', 'baleada', 'toolkit', 'toolkit'])
})

suite('unique() removes duplicates', context => {
  const instance = context.setup(),
        result = instance.unique().value

  assert.equal(result, ['baleada', 'toolkit'])
})

suite.run()
