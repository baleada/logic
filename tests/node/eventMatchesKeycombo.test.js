import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import eventMatchesKeycombo from '../../src/util/eventMatchesKeycombo.js'

const suite = createSuite('eventMatchesKeycombo (node)')

suite(`predicates single character`, context => {
  const event = { key: 'B' }

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
    event: { key: '!' },
    combo: [{ name: '!', type: 'singleCharacter' }]
  }))
})

suite(`predicates other keys`, context => {
  // Enter
  assert.ok(eventMatchesKeycombo({
    event: { key: 'Enter' },
    combo: [{ name: 'enter', type: 'other' }],
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A' },
    combo: [{ name: '!enter', type: 'other' }],
  }))
  assert.not.ok(eventMatchesKeycombo({
    event: { key: 'A' },
    combo: [{ name: 'enter', type: 'other' }],
  }))
  
  // Backspace
  assert.ok(eventMatchesKeycombo({
    event: { key: 'Backspace' },
    combo: [{ name: 'backspace', type: 'other' }],
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A' },
    combo: [{ name: '!backspace', type: 'other' }],
  }))
  assert.not.ok(eventMatchesKeycombo({
    event: { key: 'A' },
    combo: [{ name: 'backspace', type: 'other' }],
  }))
  
  // Tab
  assert.ok(eventMatchesKeycombo({
    event: { key: 'Tab' },
    combo: [{ name: 'tab', type: 'other' }],
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A' },
    combo: [{ name: '!tab', type: 'other' }],
  }))
  assert.not.ok(eventMatchesKeycombo({
    event: { key: 'A' },
    combo: [{ name: 'tab', type: 'other' }],
  }))
  
  // Space
  assert.ok(eventMatchesKeycombo({
    event: { key: ' ' },
    combo: [{ name: 'space', type: 'other' }],
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A' },
    combo: [{ name: '!space', type: 'other' }],
  }))
  assert.not.ok(eventMatchesKeycombo({
    event: { key: 'A' },
    combo: [{ name: 'space', type: 'other' }],
  }))
})

suite(`predicates arrows`, context => {
  // arrow
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowUp' },
    combo: [{ name: 'arrow', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowRight' },
    combo: [{ name: 'arrow', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowDown' },
    combo: [{ name: 'arrow', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowLeft' },
    combo: [{ name: 'arrow', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A' },
    combo: [{ name: '!arrow', type: 'arrow' }]
  }))
  
  // vertical
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowUp' },
    combo: [{ name: 'vertical', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowDown' },
    combo: [{ name: 'vertical', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowRight' },
    combo: [{ name: '!vertical', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowLeft' },
    combo: [{ name: '!vertical', type: 'arrow' }]
  }))
  
  // horizontal
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowRight' },
    combo: [{ name: 'horizontal', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowLeft' },
    combo: [{ name: 'horizontal', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowUp' },
    combo: [{ name: '!horizontal', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowDown' },
    combo: [{ name: '!horizontal', type: 'arrow' }]
  }))
  
  
  // up
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowUp' },
    combo: [{ name: 'up', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowRight' },
    combo: [{ name: '!up', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowDown' },
    combo: [{ name: '!up', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowLeft' },
    combo: [{ name: '!up', type: 'arrow' }]
  }))
  
  // right
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowUp' },
    combo: [{ name: '!right', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowRight' },
    combo: [{ name: 'right', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowDown' },
    combo: [{ name: '!right', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowLeft' },
    combo: [{ name: '!right', type: 'arrow' }]
  }))
  
  // down
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowUp' },
    combo: [{ name: '!down', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowRight' },
    combo: [{ name: '!down', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowDown' },
    combo: [{ name: 'down', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowLeft' },
    combo: [{ name: '!down', type: 'arrow' }]
  }))
  
  // left
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowUp' },
    combo: [{ name: '!left', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowRight' },
    combo: [{ name: '!left', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowDown' },
    combo: [{ name: '!left', type: 'arrow' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'ArrowLeft' },
    combo: [{ name: 'left', type: 'arrow' }]
  }))
})

suite(`predicates modifiers as keys`, context => {
  assert.ok(eventMatchesKeycombo({
    event: { key: 'Shift' },
    combo: [{ name: 'shift', type: 'modifier' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A' },
    combo: [{ name: '!shift', type: 'modifier' }]
  }))
  
  assert.ok(eventMatchesKeycombo({
    event: { key: 'Meta' },
    combo: [{ name: 'cmd', type: 'modifier' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A' },
    combo: [{ name: '!cmd', type: 'modifier' }]
  }))
  
  assert.ok(eventMatchesKeycombo({
    event: { key: 'Control' },
    combo: [{ name: 'ctrl', type: 'modifier' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A' },
    combo: [{ name: '!ctrl', type: 'modifier' }]
  }))
  
  assert.ok(eventMatchesKeycombo({
    event: { key: 'Alt' },
    combo: [{ name: 'alt', type: 'modifier' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A' },
    combo: [{ name: '!alt', type: 'modifier' }]
  }))
  
  assert.ok(eventMatchesKeycombo({
    event: { key: 'Alt' },
    combo: [{ name: 'opt', type: 'modifier' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A' },
    combo: [{ name: '!opt', type: 'modifier' }]
  }))
})

suite(`predicates modifiers as modifiers`, context => {
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A', shiftKey: true },
    combo: [{ name: 'shift', type: 'modifier' }, { name: 'a', type: 'singleCharacter' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A', shiftKey: false },
    combo: [{ name: '!shift', type: 'modifier' }, { name: 'a', type: 'singleCharacter' }]
  }))
  
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A', metaKey: true },
    combo: [{ name: 'cmd', type: 'modifier' }, { name: 'a', type: 'singleCharacter' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A', metaKey: false },
    combo: [{ name: '!cmd', type: 'modifier' }, { name: 'a', type: 'singleCharacter' }]
  }))
  
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A', ctrlKey: true },
    combo: [{ name: 'ctrl', type: 'modifier' }, { name: 'a', type: 'singleCharacter' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A', ctrlKey: false },
    combo: [{ name: '!ctrl', type: 'modifier' }, { name: 'a', type: 'singleCharacter' }]
  }))
  
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A', altKey: true },
    combo: [{ name: 'alt', type: 'modifier' }, { name: 'a', type: 'singleCharacter' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A', altKey: false },
    combo: [{ name: '!alt', type: 'modifier' }, { name: 'a', type: 'singleCharacter' }]
  }))
  
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A', altKey: true },
    combo: [{ name: 'opt', type: 'modifier' }, { name: 'a', type: 'singleCharacter' }]
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A', altKey: false },
    combo: [{ name: '!opt', type: 'modifier' }, { name: 'a', type: 'singleCharacter' }]
  }))
})

suite.run()
