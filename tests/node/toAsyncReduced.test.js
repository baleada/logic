import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import toAsyncReduced from '../../src/util/toAsyncReduced.js'

const suite = createSuite('asyncReduceable (node)')

const asyncStub = number => new Promise(function(resolve, reject) {
        setTimeout(function() {
          resolve(number)
        }, 100)
      }),
      arrayStub = (new Array(5)).fill(asyncStub)

suite(`resolved async map`, async context => {
  const value = await toAsyncReduced({
          array: arrayStub,
          reducer: async (value, asyncStub) => value + (await asyncStub(1)),
          initialValue: 0,
        }),
        expected = arrayStub.length

  assert.is(value, expected)
})

suite.run()
