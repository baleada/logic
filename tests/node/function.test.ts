import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { createTry } from '../../src/pipes/function'

const suite = createSuite('function')

suite('tries', () => {
  {
    const value = createTry<number, Error>()(() => 1),
          expected = 1

    assert.is(value, expected)
  }

  {
    const value = createTry<number, Error>()(() => {
            throw new Error('nope')
          }),
          expected = new Error('nope')

    assert.equal(value, expected)
  }
})

suite.run()
