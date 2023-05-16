import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { fromEventToAliases, aliasesByCode, aliasesByShiftCode, aliasListsByModifier } from '../../src/extracted/fromEventToAliases'

const suite = createSuite('fromEventToAliases')

suite('transforms letters', () => {
  const value = fromEventToAliases({ code: 'KeyA' } as KeyboardEvent),
        expected = ['a']

  assert.equal(value, expected)
})

suite('transforms numbers', () => {
  const value = fromEventToAliases({ code: 'Digit0' } as KeyboardEvent),
        expected = ['0']

  assert.equal(value, expected)
})

suite('transforms function', () => {
  const value = fromEventToAliases({ code: 'F1' } as KeyboardEvent),
        expected = ['f1']

  assert.equal(value, expected)
})

suite('transforms special', () => {
  for (const [code, alias] of Object.entries(aliasesByCode)) {
    const value = fromEventToAliases({ code } as KeyboardEvent),
        expected = [alias]

    assert.equal(value, expected)
  }
})

suite('transforms shift special', () => {
  for (const [code, alias] of Object.entries(aliasesByShiftCode)) {
    const value = fromEventToAliases({ code, shiftKey: true } as KeyboardEvent),
        expected = [alias]

    assert.equal(value, expected)
  }
})

suite('transforms modifiers', () => {
  for (const [key, aliases] of Object.entries(aliasListsByModifier)) {
    const value = fromEventToAliases({ key } as KeyboardEvent),
          expected = aliases

    assert.equal(value, expected)
  }
})

suite.run()
