import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { createTryAsync } from '../../src/pipes/function-async'

const suite = createSuite('function async')

suite('tries', async () => {
  {
    const value = await (createTryAsync<number, Error>()(async () => {
            await new Promise(resolve => setTimeout(resolve, 10))
            return 1
          })),
          expected = 1

    assert.is(value, expected)
  }

  {
    const value = await (createTryAsync<number, Error>()(async () => {
            await new Promise(resolve => setTimeout(resolve, 10))
            throw new Error('error')
          })),
          expected = new Error('error')

    assert.equal(value, expected)
  }
})

suite.run()
