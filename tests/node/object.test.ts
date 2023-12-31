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
  createDeepMerge,
  createOmit,
  createPick,
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
    const value = createValue<Record<any, any>>('foo')(object),
          expected = 1

    assert.equal(value, expected)
  })()

  ;(() => {
    const value = createValue<Record<any, any>>('bar')(object),
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
    const value = createHas<Record<any, any>>('foo')(object),
          expected = true

    assert.equal(value, expected)
  })()

  ;(() => {
    const value = createHas<Record<any, any>>('qux')(object),
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
        value = createEntries<Record<string, string>>()(object)

  assert.equal(value, [['one', 'value'], ['two', 'value']])
})

suite('createKeys() transforms object into keys', () => {
  const object: Record<string, string> = { one: 'value', two: 'value' },
        value = createKeys<Record<string, any>>()(object)

  assert.equal(value, ['one', 'two'])
})

suite('createSome() transforms object into some', () => {
  const object: Record<string, string> = { one: 'value', two: 'value' }

  ;(() => {
    const value = createSome<Record<string, string>>((key, value) => key && value)(object)

    assert.ok(value)
  })()

  ;(() => {
    const value = createSome<Record<string, string>>((key, value) => key && !value)(object)

    assert.not.ok(value)
  })()
})

suite('createEvery() transforms object into every', () => {
  const object: Record<string, string> = { one: 'value', two: 'value' }

  ;(() => {
    const value = createEvery<Record<string, string>>((key, value) => key && value)(object)

    assert.ok(value)
  })()

  ;(() => {
    const value = createEvery<Record<string, string>>((key, value) => key && !value)(object)

    assert.not.ok(value)
  })()
})

suite('createDeepMerge() deeply merges an object with overrides', ({ object }) => {
  {
    const value = createDeepMerge<Record<any, any>>({ foo: 2 })(object),
          expected = { foo: 2 }

    assert.equal(value, expected)
  }
  
  {
    const value = createDeepMerge<Record<any, any>>({ foo: { bar: 1, baz: [4, 5, 6] } })({ foo: { qux: 1, baz: [1, 2, 3] } }),
          expected = { foo: { bar: 1, baz: [4, 5, 6], qux: 1 } }

    assert.equal(value, expected)
  }

  {
    const value = createDeepMerge()(object),
          expected = object

    assert.equal(value, expected)
  }
})

// suite('createPredicated(...) predicates', () => {
//   const value = createPredicated(1, { a: 2, b: 3 })({ a: true, b: false }),
//         expected = 2

//   assert.is(value, expected)
// })

// suite('createPredicated(...) falls back to default value', () => {
//   const value = createPredicated(1, { a: 2, b: 3 })({ a: false, b: false }),
//         expected = 1

//   assert.is(value, expected)
// })

// suite('createPredicated(...) respects priority', () => {
//   const value = createPredicated(1, { a: 2, b: 3, c: 4 }, { priority: ['c', 'b', 'a'] })({ a: true, b: true, c: true }),
//         expected = 4

//   assert.is(value, expected)
// })

suite('createOmit(...) omits keys', () => {
  const value = createOmit(['foo'])({ foo: 1, bar: 2 }),
        expected = { bar: 2 }

  assert.equal(value, expected)
})

suite('createPick(...) picks keys', () => {
  const value = createPick(['foo'])({ foo: 1, bar: 2 }),
        expected = { foo: 1 }

  assert.equal(value, expected)
})

suite.run()
