import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { fromComboItemNameToType } from '../../src/extracted'
import { arrows, clicks, modifierAliases, modifiers, others, singleCharacters } from '../fixtures/comboMeta'

const suite = createSuite('fromComboItemNameToType (node)')

suite(`identifies singleCharacter`, () => {
  for (const singleCharacter of singleCharacters) {
    const value = fromComboItemNameToType(singleCharacter),
          expected = 'singleCharacter'

    assert.is(value, expected)
  }
})

suite(`identifies arrow`, () => {
  for (const arrow of arrows) {
    const value = fromComboItemNameToType(arrow),
          expected = 'arrow'

    assert.is(value, expected)
  }
})
    
suite(`identifies other`, () => {
  for (const other of others) {
    const value = fromComboItemNameToType(other),
          expected = 'other'

    assert.is(value, expected)
  }
})
    
suite(`identifies modifier`, () => {
  for (const modifier of modifiers.concat(modifierAliases)) {
    const value = fromComboItemNameToType(modifier),
          expected = 'modifier'

    assert.is(value, expected)
  }
})

suite(`identifies click`, () => {
  for (const click of clicks) {
    const value = fromComboItemNameToType(click),
          expected = 'click'

    assert.is(value, expected)
  }
})


suite.run()
