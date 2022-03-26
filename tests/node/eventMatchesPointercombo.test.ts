import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { modifierAliases, modifiers, pointers } from '../fixtures/comboMeta'
import { eventMatchesPointercombo } from '../../src/classes/Listenable'

const suite = createSuite('eventMatchesPointercombo')

suite(`predicates pointers`, () => {
  for (const pointer of pointers) {
    assert.ok(
      eventMatchesPointercombo(
        {} as PointerEvent,
        [pointer]
      )
    )
  }
})

suite(`predicates modifiers as modifiers`, () => {
  for (const modifier of (modifiers as string[]).concat(modifierAliases)) {
    assert.ok(
      eventMatchesPointercombo(
        {
          altKey: true,
          metaKey: true,
          shiftKey: true,
          ctrlKey: true,
        } as PointerEvent,
        [modifier, 'pointerdown']
      )
    )

    assert.not.ok(
      eventMatchesPointercombo(
        {
          altKey: false,
          metaKey: false,
          shiftKey: false,
          ctrlKey: false,
        } as PointerEvent,
        [modifier, 'pointerdown']
      )
    )
    
    assert.ok(
      eventMatchesPointercombo(
        {
          altKey: false,
          metaKey: false,
          shiftKey: false,
          ctrlKey: false,
        } as PointerEvent,
        ['!' + modifier, 'pointerdown']
      )
    )

    assert.not.ok(
      eventMatchesPointercombo(
        {
          altKey: true,
          metaKey: true,
          shiftKey: true,
          ctrlKey: true,
        } as PointerEvent,
        ['!' + modifier, 'pointerdown']
      )
    )
  }
})

suite.run()
