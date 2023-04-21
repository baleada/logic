import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import type { AssociativeArray, AssociativeArrayFns } from '../../src/factories/createAssociativeArrayFns'
import { createAssociativeArrayFns } from '../../src/factories/createAssociativeArrayFns'
import { createEqual } from '../../src/pipes/createEqual'

const suite = createSuite<{
  associativeArray: AssociativeArray<string, number>,
  associativeArrayFns: AssociativeArrayFns<string, number>,
}>('createAssociativeArrayFns')

suite.before(context => {
  context.associativeArray = [['foo', 1]]

  context.associativeArrayFns = createAssociativeArrayFns(context.associativeArray)
})

suite('get(...) works', ({ associativeArrayFns }) => {
  ;(() => {
    const value = associativeArrayFns.get('foo'),
          expected = 1

    assert.equal(value, expected)
  })()

  ;(() => {
    const value = associativeArrayFns.get('bar'),
          expected = undefined

    assert.equal(value, expected)
  })()
})

suite('set(...) works', ({ associativeArray, associativeArrayFns }) => {
  ;(() => {
    associativeArrayFns.set('foo', 2)
    const value = associativeArray,
          expected = [['foo', 2]]

    assert.equal(value, expected)
  })()

  ;(() => {
    associativeArrayFns.set('bar', 2)
    const value = associativeArray,
          expected = [['foo', 2], ['bar', 2]]

    assert.equal(value, expected)
  })()
})

suite('has(...) works', ({ associativeArrayFns }) => {
  ;(() => {
    const value = associativeArrayFns.has('foo'),
          expected = true

    assert.equal(value, expected)
  })()

  ;(() => {
    const value = associativeArrayFns.has('qux'),
          expected = false

    assert.equal(value, expected)
  })()
})

suite('delete(...) works', ({ associativeArray, associativeArrayFns }) => {
  ;(() => {
    associativeArrayFns.delete('foo')
    const value = associativeArray,
          expected = [['bar', 2]]

    assert.equal(value, expected)
  })()

  ;(() => {
    associativeArrayFns.delete('bar')
    const value = associativeArray,
          expected: AssociativeArray<string, number> = []

    assert.equal(value, expected)
  })()
})

suite('clear(...) works', ({ associativeArray, associativeArrayFns }) => {
  associativeArrayFns.set('foo', 1)
  associativeArrayFns.set('bar', 2)

  associativeArrayFns.clear()

  const value = associativeArray,
        expected: AssociativeArray<string, number> = []

  assert.equal(value, expected)
})

suite('optional key predication works', () => {
  const associativeArray: AssociativeArray<{ [key: string]: string }, number> = [
    [{ foo: 'bar' }, 1],
  ]

  const associativeArrayFns = createAssociativeArrayFns(
    associativeArray,
    { createPredicateKey: createEqual },
  )

  ;(() => {
    const value = associativeArrayFns.get({ foo: 'bar' }),
          expected = 1

    assert.equal(value, expected)
  })()

  ;(() => {
    associativeArrayFns.set({ foo: 'bar' }, 2)

    const value = associativeArray,
          expected = [
            [{ foo: 'bar' }, 2],
          ]

    assert.equal(value, expected)
  })()
})


suite.run()
