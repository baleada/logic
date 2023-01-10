import { suite as createSuite } from 'uvu'

import * as assert from 'uvu/assert'
import { eventMatchesMousecombo } from '../../src/classes/Listenable'
import { clicks, modifiers, modifierAliases } from '../fixtures/comboMeta'

const suite = createSuite('eventMatchesMousecombo')

suite(`predicates clicks`, () => {
  for (const click of clicks) {
    assert.ok(
      eventMatchesMousecombo(
        {} as MouseEvent,
        [click]
      )
    )
  }
})

suite(`predicates modifiers as modifiers`, () => {
  for (const modifier of (modifiers as string[]).concat(modifierAliases)) {
    assert.ok(
      eventMatchesMousecombo(
        {
          altKey: true,
          metaKey: true,
          shiftKey: true,
          ctrlKey: true,
        } as MouseEvent,
        [modifier, 'click']
      )
    )

    assert.not.ok(
      eventMatchesMousecombo(
        {
          altKey: false,
          metaKey: false,
          shiftKey: false,
          ctrlKey: false,
        } as MouseEvent,
        [modifier, 'click']
      )
    )

    assert.ok(
      eventMatchesMousecombo(
        {
          altKey: false,
          metaKey: false,
          shiftKey: false,
          ctrlKey: false,
        } as MouseEvent,
        ['!' + modifier, 'click']
      )
    )

    assert.not.ok(
      eventMatchesMousecombo(
        {
          altKey: true,
          metaKey: true,
          shiftKey: true,
          ctrlKey: true,
        } as MouseEvent,
        ['!' + modifier, 'click']
      )
    )
  }
})

suite.run()
