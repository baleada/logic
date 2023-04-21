import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import type { AssociativeArrayFns } from '../../src/factories/createAssociativeArrayFns'
import { createAssociativeArrayFns } from '../../src/factories/createAssociativeArrayFns'
import { createEqual } from '../../src/pipes/any'
import type { AssociativeArray } from '../../src/extracted'

const suite = createSuite<{
  initial: AssociativeArray<string, number>,
  associativeArrayFns: AssociativeArrayFns<string, number>,
}>('createAssociativeArrayFns')

suite.before(context => {
  context.initial = [['foo', 1]]

  context.associativeArrayFns = createAssociativeArrayFns({
    initial: context.initial,
  })
})

suite('toValue(...) works', ({ associativeArrayFns }) => {
  ;(() => {
    const value = associativeArrayFns.toValue('foo'),
          expected = 1

    assert.equal(value, expected)
  })()

  ;(() => {
    const value = associativeArrayFns.toValue('bar'),
          expected = undefined

    assert.equal(value, expected)
  })()
})

suite('set(...) works', ({ associativeArrayFns }) => {
  ;(() => {
    associativeArrayFns.set('foo', 2)
    const value = associativeArrayFns.toEntries(),
          expected = [['foo', 2]]

    assert.equal(value, expected)
  })()

  ;(() => {
    associativeArrayFns.set('bar', 2)
    const value = associativeArrayFns.toEntries(),
          expected = [['foo', 2], ['bar', 2]]

    assert.equal(value, expected)
  })()
})

suite('predicateHas(...) works', ({ associativeArrayFns }) => {
  ;(() => {
    const value = associativeArrayFns.predicateHas('foo'),
          expected = true

    assert.equal(value, expected)
  })()

  ;(() => {
    const value = associativeArrayFns.predicateHas('qux'),
          expected = false

    assert.equal(value, expected)
  })()
})

suite('delete(...) works', ({ associativeArrayFns }) => {
  ;(() => {
    associativeArrayFns.delete('foo')
    const value = associativeArrayFns.toEntries(),
          expected = [['bar', 2]]

    assert.equal(value, expected)
  })()

  ;(() => {
    associativeArrayFns.delete('bar')
    const value = associativeArrayFns.toEntries(),
          expected: AssociativeArray<string, number> = []

    assert.equal(value, expected)
  })()
})

suite('clear(...) works', ({ associativeArrayFns }) => {
  associativeArrayFns.set('foo', 1)
  associativeArrayFns.set('bar', 2)

  associativeArrayFns.clear()

  const value = associativeArrayFns.toEntries(),
        expected: AssociativeArray<string, number> = []

  assert.equal(value, expected)
})

suite('optional key predication works', () => {
  const initial: AssociativeArray<{ [key: string]: string }, number> = [
    [{ foo: 'bar' }, 1],
  ]

  const associativeArrayFns = createAssociativeArrayFns({
    initial,
    createPredicateKey: createEqual,
  })

  ;(() => {
    const value = associativeArrayFns.toValue({ foo: 'bar' }),
          expected = 1

    assert.equal(value, expected)
  })()

  ;(() => {
    associativeArrayFns.set({ foo: 'bar' }, 2)

    const value = associativeArrayFns.toEntries(),
          expected = [
            [{ foo: 'bar' }, 2],
          ]

    assert.equal(value, expected)
  })()
})


suite.run()
