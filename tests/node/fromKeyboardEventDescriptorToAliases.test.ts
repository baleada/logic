import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { fromKeyboardEventDescriptorToAliases, aliasesByCode, aliasesByShiftCode, aliasListsByModifier } from '../../src/extracted/fromKeyboardEventDescriptorToAliases'

const suite = createSuite('fromKeyboardEventDescriptorToAliases')

suite('transforms letters', () => {
  const value = fromKeyboardEventDescriptorToAliases({ code: 'KeyA' }),
        expected = ['a']

  assert.equal(value, expected)
})

suite('transforms numbers', () => {
  const value = fromKeyboardEventDescriptorToAliases({ code: 'Digit0' }),
        expected = ['0']

  assert.equal(value, expected)
})

suite('transforms function', () => {
  const value = fromKeyboardEventDescriptorToAliases({ code: 'F1' }),
        expected = ['f1']

  assert.equal(value, expected)
})

suite('transforms special', () => {
  for (const [code, alias] of Object.entries(aliasesByCode)) {
    const value = fromKeyboardEventDescriptorToAliases({ code }),
        expected = [alias]

    assert.equal(value, expected)
  }
})

suite('transforms shift special', () => {
  for (const [code, alias] of Object.entries(aliasesByShiftCode)) {
    const value = fromKeyboardEventDescriptorToAliases({ code, shiftKey: true }),
        expected = [alias]

    assert.equal(value, expected)
  }
})

suite('transforms modifiers', () => {
  for (const [code, aliases] of Object.entries(aliasListsByModifier)) {
    const value = fromKeyboardEventDescriptorToAliases({ code }),
          expected = aliases

    assert.equal(value, expected)
  }
})

suite.run()
