import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { toResolvedFilter } from '../../lib/index.js'

const suite = createSuite('toResolvedFilter (node)')

const conditionStub = item => new Promise(function(resolve, reject) {
        setTimeout(item => {
          resolve(item % 2 === 0)
        }, 100, item)
      }),
      arrayStub = (new Array(5)).fill().map((_, index) => index)

suite(`resolved async map`, async context => {
  const value = await toResolvedFilter({ array: arrayStub, condition: conditionStub }),
        expected = [0, 2, 4]
  
  assert.equal(value, expected)
})

suite.run()
