import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import get from '../../src/util/get.js'
import push from '../../src/util/push.js'

const suite = createSuite('push')

suite.before.each(context => {
  context.object = { a: { b: [1, 3] } }
})

suite(`pushes data to nested arrays`, ({ object }) => {
  push({ object, path: 'a.b', value: 5 })

  const value = get({ object, path: 'a.b' }),
        expected = [1, 3, 5]
  
  assert.equal(value, expected)  
})

suite.run()
