import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { createDeepEqual } from '../../src/pipes/any'
import {
  createValue,
  createHas,
  createKeys,
  createValues,
} from '../../src/pipes/associative-array'
import {
  createSet,
  createClear,
  createDelete,
} from '../../src/links/associative-array'
import type { AssociativeArray } from '../../src/extracted'

const suite = createSuite<{
  associativeArray: AssociativeArray<string, number>,
}>('associative array')

suite.before(context => {
  context.associativeArray = [['foo', 1]]
})

suite('createValue(...) works', ({ associativeArray }) => {
  ;(() => {
    const value = createValue('foo')(associativeArray),
          expected = 1

    assert.equal(value, expected)
  })()

  ;(() => {
    const value = createValue('bar')(associativeArray),
          expected = undefined

    assert.equal(value, expected)
  })()
})

suite('createSet(...) works', ({ associativeArray: initial }) => {
  const associativeArray = JSON.parse(JSON.stringify(initial)) as typeof initial

  ;(() => {
    createSet('foo', 2)(associativeArray)
    const value = associativeArray,
          expected = [['foo', 2]]

    assert.equal(value, expected)
  })()

  ;(() => {
    createSet('bar', 2)(associativeArray)
    const value = associativeArray,
          expected = [['foo', 2], ['bar', 2]]

    assert.equal(value, expected)
  })()
})

suite('createHas(...) works', ({ associativeArray }) => {
  ;(() => {
    const value = createHas('foo')(associativeArray),
          expected = true

    assert.equal(value, expected)
  })()

  ;(() => {
    const value = createHas('qux')(associativeArray),
          expected = false

    assert.equal(value, expected)
  })()
})

suite('createDelete(...) works', ({ associativeArray: initial }) => {
  const associativeArray = JSON.parse(JSON.stringify(initial)) as typeof initial
  createSet('bar', 2)(associativeArray)

  ;(() => {
    createDelete('foo')(associativeArray)
    const value = associativeArray,
          expected = [['bar', 2]]

    assert.equal(value, expected)
  })()

  ;(() => {
    createDelete('bar')(associativeArray)
    const value = associativeArray,
          expected: AssociativeArray<string, number> = []

    assert.equal(value, expected)
  })()
})

suite('createClear(...) works', ({ associativeArray: initial }) => {
  const associativeArray = JSON.parse(JSON.stringify(initial)) as typeof initial

  createSet('foo', 1)(associativeArray)
  createSet('bar', 2)(associativeArray)

  createClear()(associativeArray)

  const value = associativeArray,
        expected: AssociativeArray<string, number> = []

  assert.equal(value, expected)
})

suite('createKeys(...) works', ({ associativeArray }) => {
  const value = createKeys()(associativeArray),
        expected = ['foo']

  assert.equal(value, expected)
})

suite('createValues(...) works', ({ associativeArray }) => {
  const value = createValues()(associativeArray),
        expected = [1]

  assert.equal(value, expected)
})

suite('optional key predication works', () => {
  const associativeArray: AssociativeArray<{ [key: string]: string }, number> = [
    [{ foo: 'bar' }, 1],
  ]

  const predicateKey = createDeepEqual({ foo: 'bar' })

  ;(() => {
    const value = createValue<{ [key: string]: string }, number>(
            { foo: 'bar' },
            { predicateKey }
          )(associativeArray),
          expected = 1

    assert.equal(value, expected)
  })()

  ;(() => {
    createSet<{ [key: string]: string }, number>(
      { foo: 'bar' },
      2,
      { predicateKey }
    )(associativeArray)

    const value = associativeArray,
          expected = [
            [{ foo: 'bar' }, 2],
          ]

    assert.equal(value, expected)
  })()
})


suite.run()
