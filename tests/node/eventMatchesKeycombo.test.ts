import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { eventMatchesKeycombo } from '../../src/classes/Listenable'
import { toKey } from '../../src/extracted'
import { singleCharacters, arrows, others, modifiers, modifierAliases } from '../fixtures/comboMeta'

const suite = createSuite('eventMatchesKeycombo')

suite(`predicates single characters`, () => {
  for (const singleCharacter of singleCharacters) {
    assert.ok(
      eventMatchesKeycombo(
        { key: singleCharacter } as KeyboardEvent,
        [{ name: singleCharacter, type: 'singleCharacter' }],
      )
    )

    assert.not.ok(
      eventMatchesKeycombo(
        { key: 'Enter' } as KeyboardEvent,
        [{ name: singleCharacter, type: 'singleCharacter' }],
      )
    )
    
    assert.ok(
      eventMatchesKeycombo(
        { key: 'Enter' } as KeyboardEvent,
        [{ name: '!' + singleCharacter, type: 'singleCharacter' }],
      )
    )
    
    assert.not.ok(
      eventMatchesKeycombo(
        { key: singleCharacter } as KeyboardEvent,
        [{ name: '!' + singleCharacter, type: 'singleCharacter' }],
      )
    )
  }
})

suite(`predicates single characters whose keys are different and unsupported when altKey is true`, () => {
  assert.ok(
    eventMatchesKeycombo(
      { key: 'å', code: 'KeyA', altKey: true } as KeyboardEvent,
      [{ name: 'a', type: 'singleCharacter' }],
    )
  )
  
  assert.ok(
    eventMatchesKeycombo(
      { key: '¡', code: 'Digit1', altKey: true } as KeyboardEvent,
      [{ name: '1', type: 'singleCharacter' }],
    )
  )
})

suite(`predicates single characters whose keys are not different or unsupported when altKey is true`, () => {
  assert.ok(
    eventMatchesKeycombo(
      { key: '+', code: 'Equal', altKey: true } as KeyboardEvent,
      [{ name: '+', type: 'singleCharacter' }],
    )
  )
})

suite(`predicates others`, () => {
  for (const other of others) {
    assert.ok(
      eventMatchesKeycombo(
        { key: toKey(other) } as KeyboardEvent,
        [{ name: other, type: 'other' }],
      )
    )

    assert.not.ok(
      eventMatchesKeycombo(
        { key: 'B' } as KeyboardEvent,
        [{ name: other, type: 'other' }],
      )
    )
    
    assert.ok(
      eventMatchesKeycombo(
        { key: 'B' } as KeyboardEvent,
        [{ name: '!' + other, type: 'other' }],
      )
    )
    
    assert.not.ok(
      eventMatchesKeycombo(
        { key: toKey(other) } as KeyboardEvent,
        [{ name: '!' + other, type: 'other' }],
      )
    )
  }
})

suite(`predicates modifiers as keys`, () => {
  const modifiersAndAliases = (modifiers as string[]).concat(modifierAliases)

  for (const modifier of modifiersAndAliases) {
    assert.ok(
      eventMatchesKeycombo(
        { key: toKey(modifier) } as KeyboardEvent,
        [{ name: modifier, type: 'modifier' }],
      )
    )

    assert.not.ok(
      eventMatchesKeycombo(
        { key: 'B' } as KeyboardEvent,
        [{ name: modifier, type: 'modifier' }],
      )
    )
    
    assert.ok(
      eventMatchesKeycombo(
        { key: 'B' } as KeyboardEvent,
        [{ name: '!' + modifier, type: 'modifier' }],
      )
    )
    
    assert.not.ok(
      eventMatchesKeycombo(
        { key: toKey(modifier) } as KeyboardEvent,
        [{ name: '!' + modifier, type: 'modifier' }],
      )
    )
  }
})

suite(`predicates modifiers`, () => {
  const modifiersAndAliases = (modifiers as string[]).concat(modifierAliases),
        event = {
          altKey: false,
          metaKey: false,
          shiftKey: false,
          ctrlKey: false,
          key: 'B',
        } as KeyboardEvent,
        modifiedEvent = {
          altKey: true,
          metaKey: true,
          shiftKey: true,
          ctrlKey: true,
          key: 'B',
        } as KeyboardEvent

  for (const modifier of modifiersAndAliases) {
    assert.ok(
      eventMatchesKeycombo(
        modifiedEvent,
        [{ name: modifier, type: 'modifier' }, { name: 'B', type: 'singleCharacter' }],
      )
    )

    assert.not.ok(
      eventMatchesKeycombo(
        event,
        [{ name: modifier, type: 'modifier' }, { name: 'B', type: 'singleCharacter' }],
      )
    )
    
    assert.ok(
      eventMatchesKeycombo(
        event,
        [{ name: '!' + modifier, type: 'modifier' }, { name: 'B', type: 'singleCharacter' }],
      )
    )
    
    assert.not.ok(
      eventMatchesKeycombo(
        modifiedEvent,
        [{ name: '!' + modifier, type: 'modifier' }, { name: 'B', type: 'singleCharacter' }],
      )
    )
  }
})

suite(`predicates arrows`, () => {
  // arrow
  assert.ok(eventMatchesKeycombo(
    { key: 'ArrowUp' } as KeyboardEvent,
    [{ name: 'arrow', type: 'arrow' }]
  ))
  assert.ok(eventMatchesKeycombo(
    { key: 'ArrowRight' } as KeyboardEvent,
    [{ name: 'arrow', type: 'arrow' }]
  ))
  assert.ok(eventMatchesKeycombo(
    { key: 'ArrowDown' } as KeyboardEvent,
    [{ name: 'arrow', type: 'arrow' }]
  ))
  assert.ok(eventMatchesKeycombo(
    { key: 'ArrowLeft' } as KeyboardEvent,
    [{ name: 'arrow', type: 'arrow' }]
  ))
  assert.ok(eventMatchesKeycombo(
    { key: 'A' } as KeyboardEvent,
    [{ name: '!arrow', type: 'arrow' }]
  ))
  
  // vertical
  assert.ok(eventMatchesKeycombo(
    { key: 'ArrowUp' } as KeyboardEvent,
    [{ name: 'vertical', type: 'arrow' }]
  ))
  assert.ok(eventMatchesKeycombo(
    { key: 'ArrowDown' } as KeyboardEvent,
    [{ name: 'vertical', type: 'arrow' }]
  ))
  assert.ok(eventMatchesKeycombo(
    { key: 'ArrowRight' } as KeyboardEvent,
    [{ name: '!vertical', type: 'arrow' }]
  ))
  assert.ok(eventMatchesKeycombo(
    { key: 'ArrowLeft' } as KeyboardEvent,
    [{ name: '!vertical', type: 'arrow' }]
  ))
  
  // horizontal
  assert.ok(eventMatchesKeycombo(
    { key: 'ArrowRight' } as KeyboardEvent,
    [{ name: 'horizontal', type: 'arrow' }]
  ))
  assert.ok(eventMatchesKeycombo(
    { key: 'ArrowLeft' } as KeyboardEvent,
    [{ name: 'horizontal', type: 'arrow' }]
  ))
  assert.ok(eventMatchesKeycombo(
    { key: 'ArrowUp' } as KeyboardEvent,
    [{ name: '!horizontal', type: 'arrow' }]
  ))
  assert.ok(eventMatchesKeycombo(
    { key: 'ArrowDown' } as KeyboardEvent,
    [{ name: '!horizontal', type: 'arrow' }]
  ))
  
  // up
  assert.ok(eventMatchesKeycombo(
    { key: 'ArrowUp' } as KeyboardEvent,
    [{ name: 'up', type: 'arrow' }]
  ))
  assert.ok(eventMatchesKeycombo(
    { key: 'ArrowRight' } as KeyboardEvent,
    [{ name: '!up', type: 'arrow' }]
  ))
  assert.ok(eventMatchesKeycombo(
    { key: 'ArrowDown' } as KeyboardEvent,
    [{ name: '!up', type: 'arrow' }]
  ))
  assert.ok(eventMatchesKeycombo(
    { key: 'ArrowLeft' } as KeyboardEvent,
    [{ name: '!up', type: 'arrow' }]
  ))
  
  // right
  assert.ok(eventMatchesKeycombo(
    { key: 'ArrowUp' } as KeyboardEvent,
    [{ name: '!right', type: 'arrow' }]
  ))
  assert.ok(eventMatchesKeycombo(
    { key: 'ArrowRight' } as KeyboardEvent,
    [{ name: 'right', type: 'arrow' }]
  ))
  assert.ok(eventMatchesKeycombo(
    { key: 'ArrowDown' } as KeyboardEvent,
    [{ name: '!right', type: 'arrow' }]
  ))
  assert.ok(eventMatchesKeycombo(
    { key: 'ArrowLeft' } as KeyboardEvent,
    [{ name: '!right', type: 'arrow' }]
  ))
  
  // down
  assert.ok(eventMatchesKeycombo(
    { key: 'ArrowUp' } as KeyboardEvent,
    [{ name: '!down', type: 'arrow' }]
  ))
  assert.ok(eventMatchesKeycombo(
    { key: 'ArrowRight' } as KeyboardEvent,
    [{ name: '!down', type: 'arrow' }]
  ))
  assert.ok(eventMatchesKeycombo(
    { key: 'ArrowDown' } as KeyboardEvent,
    [{ name: 'down', type: 'arrow' }]
  ))
  assert.ok(eventMatchesKeycombo(
    { key: 'ArrowLeft' } as KeyboardEvent,
    [{ name: '!down', type: 'arrow' }]
  ))
  
  // left
  assert.ok(eventMatchesKeycombo(
    { key: 'ArrowUp' } as KeyboardEvent,
    [{ name: '!left', type: 'arrow' }]
  ))
  assert.ok(eventMatchesKeycombo(
    { key: 'ArrowRight' } as KeyboardEvent,
    [{ name: '!left', type: 'arrow' }]
  ))
  assert.ok(eventMatchesKeycombo(
    { key: 'ArrowDown' } as KeyboardEvent,
    [{ name: '!left', type: 'arrow' }]
  ))
  assert.ok(eventMatchesKeycombo(
    { key: 'ArrowLeft' } as KeyboardEvent,
    [{ name: 'left', type: 'arrow' }]
  ))
})

suite.run()
