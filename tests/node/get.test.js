import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { get } from '../../src/classes/Recognizeable.js'

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

suite(`gets last value from top level array`, () => {
  const object = [0, 1, 2]
  const value = get({ object, path: 'last' }),
  expected = 2
  
  assert.is(value, expected)
})

suite(`gets last value from nested array`, () => {
  const object = { stub: [0, 1, 2] }
  const value = get({ object, path: 'stub.last' }),
  expected = 2
  
  assert.is(value, expected)
})

suite.run()
