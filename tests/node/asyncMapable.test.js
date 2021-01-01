import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { asyncMapable } from '../../lib/index.js'

const suite = createSuite('asyncMapable (node)')

const responseStub = 'stub',
      withSuccessStub = () => new Promise(function(resolve, reject) {
        setTimeout(function() {
          resolve(responseStub)
        }, 100)
      }),
      arrayStub = (new Array(5)).fill()

suite(`resolved async map`, async context => {
  const value = await asyncMapable(arrayStub).asyncMap(async item => withSuccessStub()),
        expected = [
          'stub',
          'stub',
          'stub',
          'stub',
          'stub',
        ]
  
  assert.equal(value, expected)
})

suite.run()
