import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import type { CustomMap, CustomMapFns } from '../../src/factories/custom/createCustomMapFns'
import { createCustomMapFns } from '../../src/factories/custom/createCustomMapFns'
import { createEqual } from '../../src/pipes/createEqual'

const suite = createSuite<{
  customMap: CustomMap<string, number>,
  customMapFns: CustomMapFns<string, number>,
}>('createCustomMapFns')

suite.before(context => {
  context.customMap = [['foo', 1]]

  context.customMapFns = createCustomMapFns(context.customMap)
})

suite('get(...) works', ({ customMapFns }) => {
  ;(() => {
    const value = customMapFns.get('foo'),
          expected = 1

    assert.equal(value, expected)
  })()

  ;(() => {
    const value = customMapFns.get('bar'),
          expected = undefined

    assert.equal(value, expected)
  })()
})

suite('set(...) works', ({ customMap, customMapFns }) => {
  ;(() => {
    customMapFns.set('foo', 2)
    const value = customMap,
          expected = [['foo', 2]]

    assert.equal(value, expected)
  })()

  ;(() => {
    customMapFns.set('bar', 2)
    const value = customMap,
          expected = [['foo', 2], ['bar', 2]]

    assert.equal(value, expected)
  })()
})

suite('has(...) works', ({ customMapFns }) => {
  ;(() => {
    const value = customMapFns.has('foo'),
          expected = true

    assert.equal(value, expected)
  })()

  ;(() => {
    const value = customMapFns.has('qux'),
          expected = false

    assert.equal(value, expected)
  })()
})

suite('delete(...) works', ({ customMap, customMapFns }) => {
  ;(() => {
    customMapFns.delete('foo')
    const value = customMap,
          expected = [['bar', 2]]

    assert.equal(value, expected)
  })()

  ;(() => {
    customMapFns.delete('bar')
    const value = customMap,
          expected: CustomMap<string, number> = []

    assert.equal(value, expected)
  })()
})

suite('clear(...) works', ({ customMap, customMapFns }) => {
  customMapFns.set('foo', 1)
  customMapFns.set('bar', 2)

  customMapFns.clear()

  const value = customMap,
        expected: CustomMap<string, number> = []

  assert.equal(value, expected)
})

suite('optional key predication works', () => {
  const customMap: CustomMap<{ [key: string]: string }, number> = [
    [{ foo: 'bar' }, 1],
  ]

  const customMapFns = createCustomMapFns(
    customMap,
    { createPredicateKey: createEqual },
  )

  ;(() => {
    const value = customMapFns.get({ foo: 'bar' }),
          expected = 1

    assert.equal(value, expected)
  })()

  ;(() => {
    customMapFns.set({ foo: 'bar' }, 2)

    const value = customMap,
          expected = [
            [{ foo: 'bar' }, 2],
          ]

    assert.equal(value, expected)
  })()
})


suite.run()
