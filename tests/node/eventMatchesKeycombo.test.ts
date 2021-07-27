import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { eventMatchesKeycombo } from '../../src/classes/Listenable'

const suite = createSuite('eventMatchesKeycombo')

suite(`predicates single character`, context => {
  const event = { key: 'B' } as KeyboardEvent

  assert.ok(eventMatchesKeycombo({
    event,
    keycombo: [{ name: 'b', type: 'singleCharacter' }]
  }))
  
  assert.ok(eventMatchesKeycombo({
    event,
    keycombo: [{ name: '!a', type: 'singleCharacter' }]
  }))

  assert.not.ok(eventMatchesKeycombo({
    event,
    keycombo: [{ name: 'a', type: 'singleCharacter' }]
  }))

  assert.ok(eventMatchesKeycombo({
    event: { key: '!' } as KeyboardEvent,
    keycombo: [{ name: '!', type: 'singleCharacter' }]
  }))
})

suite(`predicates other keys`, context => {
  // Enter
  assert.ok(eventMatchesKeycombo({
    event: { key: 'Enter' } as KeyboardEvent,
    keycombo: [{ name: 'enter', type: 'other' }],
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A' } as KeyboardEvent,
    keycombo: [{ name: '!enter', type: 'other' }],
  }))
  assert.not.ok(eventMatchesKeycombo({
    event: { key: 'A' } as KeyboardEvent,
    keycombo: [{ name: 'enter', type: 'other' }],
  }))
  
  // Backspace
  assert.ok(eventMatchesKeycombo({
    event: { key: 'Backspace' } as KeyboardEvent,
    keycombo: [{ name: 'backspace', type: 'other' }],
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A' } as KeyboardEvent,
    keycombo: [{ name: '!backspace', type: 'other' }],
  }))
  assert.not.ok(eventMatchesKeycombo({
    event: { key: 'A' } as KeyboardEvent,
    keycombo: [{ name: 'backspace', type: 'other' }],
  }))
  
  // Tab
  assert.ok(eventMatchesKeycombo({
    event: { key: 'Tab' } as KeyboardEvent,
    keycombo: [{ name: 'tab', type: 'other' }],
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A' } as KeyboardEvent,
    keycombo: [{ name: '!tab', type: 'other' }],
  }))
  assert.not.ok(eventMatchesKeycombo({
    event: { key: 'A' } as KeyboardEvent,
    keycombo: [{ name: 'tab', type: 'other' }],
  }))
  
  // Space
  assert.ok(eventMatchesKeycombo({
    event: { key: ' ' } as KeyboardEvent,
    keycombo: [{ name: 'space', type: 'other' }],
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A' } as KeyboardEvent,
    keycombo: [{ name: '!space', type: 'other' }],
  }))
  assert.not.ok(eventMatchesKeycombo({
    event: { key: 'A' } as KeyboardEvent,
    keycombo: [{ name: 'space', type: 'other' }],
  }))
  
  // Escape
  assert.ok(eventMatchesKeycombo({
    event: { key: 'Escape' } as KeyboardEvent,
    keycombo: [{ name: 'esc', type: 'other' }],
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A' } as KeyboardEvent,
    keycombo: [{ name: '!esc', type: 'other' }],
  }))
  assert.not.ok(eventMatchesKeycombo({
    event: { key: 'A' } as KeyboardEvent,
    keycombo: [{ name: 'esc', type: 'other' }],
  }))
})

suite(`predicates arrows`, context => {
  // arrow
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowUp' } as KeyboardEvent,
    keycombo: [{ name: 'arrow', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowRight' } as KeyboardEvent,
    keycombo: [{ name: 'arrow', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowDown' } as KeyboardEvent,
    keycombo: [{ name: 'arrow', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowLeft' } as KeyboardEvent,
    keycombo: [{ name: 'arrow', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A' } as KeyboardEvent,
    keycombo: [{ name: '!arrow', type: 'arrow' }]
  }))
  
  // vertical
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowUp' } as KeyboardEvent,
    keycombo: [{ name: 'vertical', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowDown' } as KeyboardEvent,
    keycombo: [{ name: 'vertical', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowRight' } as KeyboardEvent,
    keycombo: [{ name: '!vertical', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowLeft' } as KeyboardEvent,
    keycombo: [{ name: '!vertical', type: 'arrow' }]
  }))
  
  // horizontal
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowRight' } as KeyboardEvent,
    keycombo: [{ name: 'horizontal', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowLeft' } as KeyboardEvent,
    keycombo: [{ name: 'horizontal', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowUp' } as KeyboardEvent,
    keycombo: [{ name: '!horizontal', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowDown' } as KeyboardEvent,
    keycombo: [{ name: '!horizontal', type: 'arrow' }]
  }))
  
  
  // up
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowUp' } as KeyboardEvent,
    keycombo: [{ name: 'up', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowRight' } as KeyboardEvent,
    keycombo: [{ name: '!up', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowDown' } as KeyboardEvent,
    keycombo: [{ name: '!up', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowLeft' } as KeyboardEvent,
    keycombo: [{ name: '!up', type: 'arrow' }]
  }))
  
  // right
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowUp' } as KeyboardEvent,
    keycombo: [{ name: '!right', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowRight' } as KeyboardEvent,
    keycombo: [{ name: 'right', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowDown' } as KeyboardEvent,
    keycombo: [{ name: '!right', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowLeft' } as KeyboardEvent,
    keycombo: [{ name: '!right', type: 'arrow' }]
  }))
  
  // down
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowUp' } as KeyboardEvent,
    keycombo: [{ name: '!down', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowRight' } as KeyboardEvent,
    keycombo: [{ name: '!down', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowDown' } as KeyboardEvent,
    keycombo: [{ name: 'down', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowLeft' } as KeyboardEvent,
    keycombo: [{ name: '!down', type: 'arrow' }]
  }))
  
  // left
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowUp' } as KeyboardEvent,
    keycombo: [{ name: '!left', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowRight' } as KeyboardEvent,
    keycombo: [{ name: '!left', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowDown' } as KeyboardEvent,
    keycombo: [{ name: '!left', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowLeft' } as KeyboardEvent,
    keycombo: [{ name: 'left', type: 'arrow' }]
  }))
})

suite(`predicates modifiers as keys`, context => {
  assert.ok(eventMatchesKeycombo({
    event: { key: 'Shift' } as KeyboardEvent,
    keycombo: [{ name: 'shift', type: 'modifier' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A' } as KeyboardEvent,
    keycombo: [{ name: '!shift', type: 'modifier' }]
  }))
  
  assert.ok(eventMatchesKeycombo({
    event: { key: 'Meta' } as KeyboardEvent,
    keycombo: [{ name: 'cmd', type: 'modifier' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A' } as KeyboardEvent,
    keycombo: [{ name: '!cmd', type: 'modifier' }]
  }))
  
  assert.ok(eventMatchesKeycombo({
    event: { key: 'Control' } as KeyboardEvent,
    keycombo: [{ name: 'ctrl', type: 'modifier' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A' } as KeyboardEvent,
    keycombo: [{ name: '!ctrl', type: 'modifier' }]
  }))
  
  assert.ok(eventMatchesKeycombo({
    event: { key: 'Alt' } as KeyboardEvent,
    keycombo: [{ name: 'alt', type: 'modifier' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A' } as KeyboardEvent,
    keycombo: [{ name: '!alt', type: 'modifier' }]
  }))
  
  assert.ok(eventMatchesKeycombo({
    event: { key: 'Alt' } as KeyboardEvent,
    keycombo: [{ name: 'opt', type: 'modifier' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A' } as KeyboardEvent,
    keycombo: [{ name: '!opt', type: 'modifier' }]
  }))
})

suite(`predicates modifiers as modifiers`, context => {
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A', shiftKey: true } as KeyboardEvent,
    keycombo: [{ name: 'shift', type: 'modifier' }, { name: 'a', type: 'singleCharacter' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A', shiftKey: false } as KeyboardEvent,
    keycombo: [{ name: '!shift', type: 'modifier' }, { name: 'a', type: 'singleCharacter' }]
  }))
  
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A', metaKey: true } as KeyboardEvent,
    keycombo: [{ name: 'cmd', type: 'modifier' }, { name: 'a', type: 'singleCharacter' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A', metaKey: false } as KeyboardEvent,
    keycombo: [{ name: '!cmd', type: 'modifier' }, { name: 'a', type: 'singleCharacter' }]
  }))
  
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A', ctrlKey: true } as KeyboardEvent,
    keycombo: [{ name: 'ctrl', type: 'modifier' }, { name: 'a', type: 'singleCharacter' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A', ctrlKey: false } as KeyboardEvent,
    keycombo: [{ name: '!ctrl', type: 'modifier' }, { name: 'a', type: 'singleCharacter' }]
  }))
  
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A', altKey: true } as KeyboardEvent,
    keycombo: [{ name: 'alt', type: 'modifier' }, { name: 'a', type: 'singleCharacter' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A', altKey: false } as KeyboardEvent,
    keycombo: [{ name: '!alt', type: 'modifier' }, { name: 'a', type: 'singleCharacter' }]
  }))
  
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A', altKey: true } as KeyboardEvent,
    keycombo: [{ name: 'opt', type: 'modifier' }, { name: 'a', type: 'singleCharacter' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A', altKey: false } as KeyboardEvent,
    keycombo: [{ name: '!opt', type: 'modifier' }, { name: 'a', type: 'singleCharacter' }]
  }))
})

suite.run()
