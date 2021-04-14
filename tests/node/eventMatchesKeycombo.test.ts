import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { eventMatchesKeycombo } from '../../src/classes/Listenable'

const suite = createSuite('eventMatchesKeycombo (node)')

suite(`predicates single character`, context => {
  const event = { key: 'B' } as KeyboardEvent

  assert.ok(eventMatchesKeycombo({
    event,
    combo: [{ name: 'b', type: 'singleCharacter' }]
  }))
  
  assert.ok(eventMatchesKeycombo({
    event,
    combo: [{ name: '!a', type: 'singleCharacter' }]
  }))

  assert.not.ok(eventMatchesKeycombo({
    event,
    combo: [{ name: 'a', type: 'singleCharacter' }]
  }))

  assert.ok(eventMatchesKeycombo({
    event: { key: '!' } as KeyboardEvent,
    combo: [{ name: '!', type: 'singleCharacter' }]
  }))
})

suite(`predicates other keys`, context => {
  // Enter
  assert.ok(eventMatchesKeycombo({
    event: { key: 'Enter' } as KeyboardEvent,
    combo: [{ name: 'enter', type: 'other' }],
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A' } as KeyboardEvent,
    combo: [{ name: '!enter', type: 'other' }],
  }))
  assert.not.ok(eventMatchesKeycombo({
    event: { key: 'A' } as KeyboardEvent,
    combo: [{ name: 'enter', type: 'other' }],
  }))
  
  // Backspace
  assert.ok(eventMatchesKeycombo({
    event: { key: 'Backspace' } as KeyboardEvent,
    combo: [{ name: 'backspace', type: 'other' }],
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A' } as KeyboardEvent,
    combo: [{ name: '!backspace', type: 'other' }],
  }))
  assert.not.ok(eventMatchesKeycombo({
    event: { key: 'A' } as KeyboardEvent,
    combo: [{ name: 'backspace', type: 'other' }],
  }))
  
  // Tab
  assert.ok(eventMatchesKeycombo({
    event: { key: 'Tab' } as KeyboardEvent,
    combo: [{ name: 'tab', type: 'other' }],
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A' } as KeyboardEvent,
    combo: [{ name: '!tab', type: 'other' }],
  }))
  assert.not.ok(eventMatchesKeycombo({
    event: { key: 'A' } as KeyboardEvent,
    combo: [{ name: 'tab', type: 'other' }],
  }))
  
  // Space
  assert.ok(eventMatchesKeycombo({
    event: { key: ' ' } as KeyboardEvent,
    combo: [{ name: 'space', type: 'other' }],
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A' } as KeyboardEvent,
    combo: [{ name: '!space', type: 'other' }],
  }))
  assert.not.ok(eventMatchesKeycombo({
    event: { key: 'A' } as KeyboardEvent,
    combo: [{ name: 'space', type: 'other' }],
  }))
  
  // Escape
  assert.ok(eventMatchesKeycombo({
    event: { key: 'Escape' } as KeyboardEvent,
    combo: [{ name: 'esc', type: 'other' }],
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A' } as KeyboardEvent,
    combo: [{ name: '!esc', type: 'other' }],
  }))
  assert.not.ok(eventMatchesKeycombo({
    event: { key: 'A' } as KeyboardEvent,
    combo: [{ name: 'esc', type: 'other' }],
  }))
})

suite(`predicates arrows`, context => {
  // arrow
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowUp' } as KeyboardEvent,
    combo: [{ name: 'arrow', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowRight' } as KeyboardEvent,
    combo: [{ name: 'arrow', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowDown' } as KeyboardEvent,
    combo: [{ name: 'arrow', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowLeft' } as KeyboardEvent,
    combo: [{ name: 'arrow', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A' } as KeyboardEvent,
    combo: [{ name: '!arrow', type: 'arrow' }]
  }))
  
  // vertical
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowUp' } as KeyboardEvent,
    combo: [{ name: 'vertical', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowDown' } as KeyboardEvent,
    combo: [{ name: 'vertical', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowRight' } as KeyboardEvent,
    combo: [{ name: '!vertical', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowLeft' } as KeyboardEvent,
    combo: [{ name: '!vertical', type: 'arrow' }]
  }))
  
  // horizontal
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowRight' } as KeyboardEvent,
    combo: [{ name: 'horizontal', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowLeft' } as KeyboardEvent,
    combo: [{ name: 'horizontal', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowUp' } as KeyboardEvent,
    combo: [{ name: '!horizontal', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowDown' } as KeyboardEvent,
    combo: [{ name: '!horizontal', type: 'arrow' }]
  }))
  
  
  // up
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowUp' } as KeyboardEvent,
    combo: [{ name: 'up', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowRight' } as KeyboardEvent,
    combo: [{ name: '!up', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowDown' } as KeyboardEvent,
    combo: [{ name: '!up', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowLeft' } as KeyboardEvent,
    combo: [{ name: '!up', type: 'arrow' }]
  }))
  
  // right
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowUp' } as KeyboardEvent,
    combo: [{ name: '!right', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowRight' } as KeyboardEvent,
    combo: [{ name: 'right', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowDown' } as KeyboardEvent,
    combo: [{ name: '!right', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowLeft' } as KeyboardEvent,
    combo: [{ name: '!right', type: 'arrow' }]
  }))
  
  // down
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowUp' } as KeyboardEvent,
    combo: [{ name: '!down', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowRight' } as KeyboardEvent,
    combo: [{ name: '!down', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowDown' } as KeyboardEvent,
    combo: [{ name: 'down', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowLeft' } as KeyboardEvent,
    combo: [{ name: '!down', type: 'arrow' }]
  }))
  
  // left
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowUp' } as KeyboardEvent,
    combo: [{ name: '!left', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowRight' } as KeyboardEvent,
    combo: [{ name: '!left', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowDown' } as KeyboardEvent,
    combo: [{ name: '!left', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowLeft' } as KeyboardEvent,
    combo: [{ name: 'left', type: 'arrow' }]
  }))
})

suite(`predicates modifiers as keys`, context => {
  assert.ok(eventMatchesKeycombo({
    event: { key: 'Shift' } as KeyboardEvent,
    combo: [{ name: 'shift', type: 'modifier' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A' } as KeyboardEvent,
    combo: [{ name: '!shift', type: 'modifier' }]
  }))
  
  assert.ok(eventMatchesKeycombo({
    event: { key: 'Meta' } as KeyboardEvent,
    combo: [{ name: 'cmd', type: 'modifier' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A' } as KeyboardEvent,
    combo: [{ name: '!cmd', type: 'modifier' }]
  }))
  
  assert.ok(eventMatchesKeycombo({
    event: { key: 'Control' } as KeyboardEvent,
    combo: [{ name: 'ctrl', type: 'modifier' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A' } as KeyboardEvent,
    combo: [{ name: '!ctrl', type: 'modifier' }]
  }))
  
  assert.ok(eventMatchesKeycombo({
    event: { key: 'Alt' } as KeyboardEvent,
    combo: [{ name: 'alt', type: 'modifier' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A' } as KeyboardEvent,
    combo: [{ name: '!alt', type: 'modifier' }]
  }))
  
  assert.ok(eventMatchesKeycombo({
    event: { key: 'Alt' } as KeyboardEvent,
    combo: [{ name: 'opt', type: 'modifier' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A' } as KeyboardEvent,
    combo: [{ name: '!opt', type: 'modifier' }]
  }))
})

suite(`predicates modifiers as modifiers`, context => {
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A', shiftKey: true } as KeyboardEvent,
    combo: [{ name: 'shift', type: 'modifier' }, { name: 'a', type: 'singleCharacter' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A', shiftKey: false } as KeyboardEvent,
    combo: [{ name: '!shift', type: 'modifier' }, { name: 'a', type: 'singleCharacter' }]
  }))
  
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A', metaKey: true } as KeyboardEvent,
    combo: [{ name: 'cmd', type: 'modifier' }, { name: 'a', type: 'singleCharacter' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A', metaKey: false } as KeyboardEvent,
    combo: [{ name: '!cmd', type: 'modifier' }, { name: 'a', type: 'singleCharacter' }]
  }))
  
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A', ctrlKey: true } as KeyboardEvent,
    combo: [{ name: 'ctrl', type: 'modifier' }, { name: 'a', type: 'singleCharacter' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A', ctrlKey: false } as KeyboardEvent,
    combo: [{ name: '!ctrl', type: 'modifier' }, { name: 'a', type: 'singleCharacter' }]
  }))
  
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A', altKey: true } as KeyboardEvent,
    combo: [{ name: 'alt', type: 'modifier' }, { name: 'a', type: 'singleCharacter' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A', altKey: false } as KeyboardEvent,
    combo: [{ name: '!alt', type: 'modifier' }, { name: 'a', type: 'singleCharacter' }]
  }))
  
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A', altKey: true } as KeyboardEvent,
    combo: [{ name: 'opt', type: 'modifier' }, { name: 'a', type: 'singleCharacter' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A', altKey: false } as KeyboardEvent,
    combo: [{ name: '!opt', type: 'modifier' }, { name: 'a', type: 'singleCharacter' }]
  }))
})

suite.run()
