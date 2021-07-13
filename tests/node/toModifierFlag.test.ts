import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { toModifierFlag } from '../../src/extracted'
import type { ListenableModifier } from '../../src/extracted'
import { modifierAliases, modifiers } from '../fixtures/comboMeta'

const suite = createSuite('toModifierFlag (node)')

suite(`gets modifier flag`, context => {
  (() => {
    const value = toModifierFlag('shift'),
          expected = 'shiftKey'

    assert.is(value, expected)
  })();

  (() => {
    const value = toModifierFlag('cmd'),
          expected = 'metaKey'

    assert.is(value, expected)
  })();

  (() => {
    const value = toModifierFlag('command'),
          expected = 'metaKey'

    assert.is(value, expected)
  })();

  (() => {
    const value = toModifierFlag('meta'),
          expected = 'metaKey'

    assert.is(value, expected)
  })();

  (() => {
    const value = toModifierFlag('ctrl'),
          expected = 'ctrlKey'

    assert.is(value, expected)
  })();

  (() => {
    const value = toModifierFlag('control'),
          expected = 'ctrlKey'

    assert.is(value, expected)
  })();

  (() => {
    const value = toModifierFlag('alt'),
          expected = 'altKey'

    assert.is(value, expected)
  })();

  (() => {
    const value = toModifierFlag('opt'),
          expected = 'altKey'

    assert.is(value, expected)
  })();

  (() => {
    const value = toModifierFlag('option'),
          expected = 'altKey'

    assert.is(value, expected)
  })();
})

suite(`handles all modifiers and aliases`, context => {
  for (const modifierOrAlias of modifiers.concat(modifierAliases as ListenableModifier[])) {
    const value = toModifierFlag(modifierOrAlias)

    assert.ok(value)
  }
})

suite.run()
