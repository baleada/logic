import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { eventMatchesClickcombo } from '../../src/classes/Listenable'
import { clicks, modifiers, modifierAliases } from '../fixtures/comboMeta'

const suite = createSuite('eventMatchesClickcombo')

suite(`predicates clicks`, () => {
  for (const click of clicks) {
    assert.ok(
      eventMatchesClickcombo({
        event: {} as MouseEvent,
        clickcombo: [click]
      })
    )
  }
})

suite(`predicates modifiers as modifiers`, () => {
  for (const modifier of (modifiers as string[]).concat(modifierAliases)) {
    assert.ok(
      eventMatchesClickcombo({
        event: {
          altKey: true,
          metaKey: true,
          shiftKey: true,
          ctrlKey: true,
        } as MouseEvent,
        clickcombo: [modifier, 'click']
      })
    )

    assert.not.ok(
      eventMatchesClickcombo({
        event: {
          altKey: false,
          metaKey: false,
          shiftKey: false,
          ctrlKey: false,
        } as MouseEvent,
        clickcombo: [modifier, 'click']
      })
    )

    assert.ok(
      eventMatchesClickcombo({
        event: {
          altKey: false,
          metaKey: false,
          shiftKey: false,
          ctrlKey: false,
        } as MouseEvent,
        clickcombo: ['!' + modifier, 'click']
      })
    )

    assert.not.ok(
      eventMatchesClickcombo({
        event: {
          altKey: true,
          metaKey: true,
          shiftKey: true,
          ctrlKey: true,
        } as MouseEvent,
        clickcombo: ['!' + modifier, 'click']
      })
    )
  }
})

suite.run()
