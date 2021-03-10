import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { set } from '../../src/util.js'
import { get } from '../../src/util.js'

const suite = createSuite('set')

suite.before.each(context => {
  context.object = { 'a': [{ 'b': { 'c': 3 } }] }
})

suite(`sets object values`, ({ object }) => {
  set({ object, path: 'a', value: 4 })

  const value = get({ object, path: 'a' }),
        expected = 4
  
  assert.is(value, expected)
})

suite(`sets nested object values`, ({ object }) => {
  set({ object, path: 'a.0.b.c', value: 4 })

  const value = get({ object, path: 'a.0.b.c' }),
        expected = 4
  
  assert.is(value, expected)
})

suite(`sets nested array values`, ({ object }) => {
  set({ object, path: 'a.0.b.c', value: 4 })

  const value = get({ object, path: 'a.0.b.c' }),
        expected = 4
  
  assert.is(value, expected)
})

suite(`creates nested object values`, ({ object }) => {
  set({ object, path: 'x.0.y.z', value: 5 })

  const value = get({ object, path: 'x.0.y.z' }),
        expected = 5
  
  assert.is(value, expected)  
})

suite(`creates nested array values`, ({ object }) => {
  set({ object, path: 'x.0.y.z', value: 5 })

  const value = get({ object, path: 'x.0.y.z' }),
        expected = 5
  
  assert.is(value, expected)  
})

suite.run()
