import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { modifierAliases, modifiers, pointers } from '../fixtures/comboMeta'
import { eventMatchesPointercombo } from '../../src/classes/Listenable'

const suite = createSuite('eventMatchesPointercombo')

suite(`predicates pointers`, () => {
  for (const pointer of pointers) {
    assert.ok(
      eventMatchesPointercombo({
        event: {} as PointerEvent,
        pointercombo: [pointer]
      })
    )
  }
})

suite(`predicates modifiers as modifiers`, () => {
  for (const modifier of (modifiers as string[]).concat(modifierAliases)) {
    assert.ok(
      eventMatchesPointercombo({
        event: {
          altKey: true,
          metaKey: true,
          shiftKey: true,
          ctrlKey: true,
        } as PointerEvent,
        pointercombo: [modifier, 'pointerdown']
      })
    )

    assert.not.ok(
      eventMatchesPointercombo({
        event: {
          altKey: false,
          metaKey: false,
          shiftKey: false,
          ctrlKey: false,
        } as PointerEvent,
        pointercombo: [modifier, 'pointerdown']
      })
    )
    
    assert.ok(
      eventMatchesPointercombo({
        event: {
          altKey: false,
          metaKey: false,
          shiftKey: false,
          ctrlKey: false,
        } as PointerEvent,
        pointercombo: ['!' + modifier, 'pointerdown']
      })
    )

    assert.not.ok(
      eventMatchesPointercombo({
        event: {
          altKey: true,
          metaKey: true,
          shiftKey: true,
          ctrlKey: true,
        } as PointerEvent,
        pointercombo: ['!' + modifier, 'pointerdown']
      })
    )
  }
})

suite.run()
