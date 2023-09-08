import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { createList } from '../../src/pipes/class-value'

const suite = createSuite('class value')

suite('createList(...) creates space-separated list of truthy values', () => {
  const value = (() => {
    return createList()('foo', 0, null, undefined, 'bar', 42, false)
  })()

  assert.is(value, 'foo bar 42')
})

suite.run()
