import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { length } from '../../src/extracted/lazy-collections'

const suite = createSuite('lazy collections')

suite('length', () => {
  ;(() => {
    const value = length()([1, 2, 3]),
          expected = 3

    assert.is(value, expected)
  })()

  ;(() => {
    const value = length()(new Set([1, 2, 3])),
          expected = 3

    assert.is(value, expected)
  })()

  ;(() => {
    function* nums () {
      yield 1
      yield 2
      yield 3
    }

    const value = length()(nums()),
          expected = 3

    assert.is(value, expected)
  })()
})

suite.run()
