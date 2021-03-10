import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { get } from '../../src/util.js'
import { insert } from '../../src/util.js'

const suite = createSuite('insert')

suite.before.each(context => {
  context.object = { a: { b: [1, 3] } }
})

suite(`inserts data to nested arrays`, ({ object }) => {
  insert({ object, path: 'a.b', value: 5, index: 0 })

  const value = get({ object, path: 'a.b' }),
        expected = [5, 1, 3]
  
  assert.equal(value, expected)  
})

suite.run()
