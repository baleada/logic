import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { toProperties }  from '../../src/classes/Animateable'

const suite = createSuite('toProperties')

suite(`transforms keyframes to properties`, () => {
  const value = toProperties([
          { progress: 0, properties: { foo: 'bar' } },
          { progress: 0.25, properties: { foo: 'bar', stub: 'example' } },
          { progress: 0.5, properties: { foo: 'bar', stub: 'example' } },
          { progress: 0.75, properties: { foo: 'bar', qux: 'baz' } },
          { progress: 1, properties: { foo: 'bar', poop: 'lol' } },
        ]),
        expected = ['foo', 'stub', 'qux', 'poop']

  assert.equal(value, expected)  
})

suite.run()
