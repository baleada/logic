import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { toModifier } from '../../src/extracted'
import type { ListenableModifier } from '../../src/extracted'
import { modifierAliases, modifiers } from '../fixtures/comboMeta'

const suite = createSuite('toModifier')

suite(`correctly aliases modifiers`, context => {
  for (const modifier of modifiers) {
    const value = toModifier(modifier),
          expected = modifier

    assert.is(value, expected)
  }

  (() => {
    const value = toModifier('cmd'),
          expected = 'meta'

    assert.is(value, expected)
  })();

  (() => {
    const value = toModifier('command'),
          expected = 'meta'

    assert.is(value, expected)
  })();

  (() => {
    const value = toModifier('ctrl'),
          expected = 'control'

    assert.is(value, expected)
  })();

  (() => {
    const value = toModifier('opt'),
          expected = 'alt'

    assert.is(value, expected)
  })();

  (() => {
    const value = toModifier('option'),
          expected = 'alt'

    assert.is(value, expected)
  })();
})

suite(`handles all modifiers and aliases`, context => {
  for (const modifierOrAlias of modifiers.concat(modifierAliases as ListenableModifier[])) {
    const value = toModifier(modifierOrAlias)

    assert.ok(value)
  }
})

suite.run()
