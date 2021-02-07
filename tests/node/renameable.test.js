import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { renameable } from '../../lib/index.js'

const suite = createSuite('renameable (node)')

suite.before.each(context => {
  context.setup = () => renameable(new Map([['one', 'value'], ['two', 'value']]))
})

suite('rename({ from, to }) renames "from" name to "to" name', context => {
  const instance = context.setup(),
        result = instance.rename({ from: 'one', to: 'uno' }).value

  assert.equal(result, new Map([['uno', 'value'], ['two', 'value']]))
})

suite.run()
