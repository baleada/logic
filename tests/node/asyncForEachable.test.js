import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { asyncForEachable } from '../../lib/index.js'

const suite = createSuite('asyncForEachable (node)')

const responseStub = 'stub',
      withSuccessStub = () => new Promise(function(resolve, reject) {
        setTimeout(function() {
          resolve(responseStub)
        }, 100)
      }),
      arrayStub = (new Array(5)).fill()

suite(`resolved async map`, async context => {
  let value = []
  
  await asyncForEachable(arrayStub).asyncForEach(async () => value.push(await withSuccessStub()))
  const expected = [
          'stub',
          'stub',
          'stub',
          'stub',
          'stub',
        ]
  
  assert.equal(value, expected)
})

suite.run()
