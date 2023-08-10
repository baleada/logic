import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import {
  createValue,
  createHas,
  createKeys,
  createValues,
  createEntries,
  createSome,
  createEvery,
} from '../../src/pipes/object'
import {
  createSet,
  createClear,
  createDelete,
} from '../../src/links/object'

const suite = createSuite<{
  object: Record<string, number>,
}>('object')

suite.before(context => {
  context.object = { foo: 1 }
})

suite('createValue(...) works', ({ object }) => {
  ;(() => {
    const value = createValue('foo')(object),
          expected = 1

    assert.equal(value, expected)
  })()

  ;(() => {
    const value = createValue('bar')(object),
          expected = undefined

    assert.equal(value, expected)
  })()
})

suite('createSet(...) works', ({ object: initial }) => {
  const object = JSON.parse(JSON.stringify(initial)) as typeof initial

  ;(() => {
    createSet('foo', 2)(object)
    const value = object,
          expected = { foo: 2 }

    assert.equal(value, expected)
  })()

  ;(() => {
    createSet('bar', 2)(object)
    const value = object,
          expected = { foo: 2, bar: 2 }

    assert.equal(value, expected)
  })()
})

suite('createHas(...) works', ({ object }) => {
  ;(() => {
    const value = createHas('foo')(object),
          expected = true

    assert.equal(value, expected)
  })()

  ;(() => {
    const value = createHas('qux')(object),
          expected = false

    assert.equal(value, expected)
  })()
})

suite('createDelete(...) works', ({ object: initial }) => {
  const object = JSON.parse(JSON.stringify(initial)) as typeof initial
  createSet('bar', 2)(object)

  ;(() => {
    createDelete('foo')(object)
    const value = object,
          expected = { bar: 2 }

    assert.equal(value, expected)
  })()

  ;(() => {
    createDelete('bar')(object)
    const value = object,
          expected: Record<string, number> = {}

    assert.equal(value, expected)
  })()
})

suite('createClear(...) works', ({ object: initial }) => {
  const object = JSON.parse(JSON.stringify(initial)) as typeof initial

  createSet('foo', 1)(object)
  createSet('bar', 2)(object)

  createClear()(object)

  const value = object,
        expected: Record<string, number> = {}

  assert.equal(value, expected)
})

suite('createKeys(...) works', ({ object }) => {
  const value = createKeys()(object),
        expected = ['foo']

  assert.equal(value, expected)
})

suite('createValues(...) works', ({ object }) => {
  const value = createValues()(object),
        expected = [1]

  assert.equal(value, expected)
})

suite('createEntries() transforms object into entries', () => {
  const object: Record<string, string> = { one: 'value', two: 'value' },
        value = createEntries<string, string>()(object)

  assert.equal(value, [['one', 'value'], ['two', 'value']])
})

suite('createKeys() transforms object into keys', () => {
  const object: Record<string, string> = { one: 'value', two: 'value' },
        value = createKeys<string>()(object)

  assert.equal(value, ['one', 'two'])
})

suite('createSome() transforms object into some', () => {
  const object: Record<string, string> = { one: 'value', two: 'value' }

  ;(() => {
    const value = createSome<string, string>((key, value) => key && value)(object)

    assert.ok(value)
  })()

  ;(() => {
    const value = createSome<string, string>((key, value) => key && !value)(object)

    assert.not.ok(value)
  })()
})

suite('createEvery() transforms object into every', () => {
  const object: Record<string, string> = { one: 'value', two: 'value' }

  ;(() => {
    const value = createEvery<string, string>((key, value) => key && value)(object)

    assert.ok(value)
  })()

  ;(() => {
    const value = createEvery<string, string>((key, value) => key && !value)(object)

    assert.not.ok(value)
  })()
})

suite.run()
