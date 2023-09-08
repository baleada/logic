import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import {
  createEqual,
  createDeepEqual,
  createClone,
} from '../../src/pipes/any'

const suite = createSuite('any')

suite('createEqual(...) predicates equality', () => {
  ;(() => {
    const value = createEqual(1)(1),
          expected = true

    assert.is(value, expected)
  })()
  
  ;(() => {
    const value = createEqual(1)(2),
          expected = false

    assert.is(value, expected)
  })()
  
  ;(() => {
    const value = createEqual({ hello: 'world' })({ hello: 'world' }),
          expected = false

    assert.is(value, expected)
  })()
})

suite('createDeepEqual(...) predicates equality', () => {
  ;(() => {
    const value = createDeepEqual(1)(1),
          expected = true

    assert.is(value, expected)
  })()
  
  ;(() => {
    const value = createDeepEqual(1)(2),
          expected = false

    assert.is(value, expected)
  })()
  
  ;(() => {
    const value = createDeepEqual({ hello: 'world' })({ hello: 'world' }),
          expected = true

    assert.is(value, expected)
  })()
})

suite('createClone(...) deep clones', () => {
  const object = { hello: 'world' },
        value = createClone()(object),
        expected = { hello: 'world' }

  assert.equal(value, expected)  
})

suite.run()
