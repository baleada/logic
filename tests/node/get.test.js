import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import get from '../../src/util/get.js'

const suite = createSuite('get')

suite.before.each(context => {
  context.object = { 'a': [{ 'b': { 'c': 3 } }] }
})

suite(`gets top level object values`, ({ object }) => {
  const value = get({ object, path: 'a' }),
        expected = [{ 'b': { 'c': 3 } }]
  
  assert.equal(value, expected)
})

suite(`gets nested object values`, ({ object }) => {
  const value = get({ object, path: 'a.0.b.c' }),
        expected = 3
  
  assert.is(value, expected)
})

suite(`gets nested array values`, ({ object }) => {
  const value = get({ object, path: 'a.0.b.c' }),
        expected = 3
  
  assert.is(value, expected)
})

suite.run()
