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

suite(`predicates enter, backspace, tab, and space`, context => {
  // Enter
  assert.ok(eventMatchesKeycombo({
    event: { key: 'Enter' },
    combo: [{ name: 'enter', type: 'enterBackspaceTabSpace' }],
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A' },
    combo: [{ name: '!enter', type: 'enterBackspaceTabSpace' }],
  }))
  assert.not.ok(eventMatchesKeycombo({
    event: { key: 'A' },
    combo: [{ name: 'enter', type: 'enterBackspaceTabSpace' }],
  }))
  
  // Backspace
  assert.ok(eventMatchesKeycombo({
    event: { key: 'Backspace' },
    combo: [{ name: 'backspace', type: 'enterBackspaceTabSpace' }],
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A' },
    combo: [{ name: '!backspace', type: 'enterBackspaceTabSpace' }],
  }))
  assert.not.ok(eventMatchesKeycombo({
    event: { key: 'A' },
    combo: [{ name: 'backspace', type: 'enterBackspaceTabSpace' }],
  }))
  
  // Tab
  assert.ok(eventMatchesKeycombo({
    event: { key: 'Tab' },
    combo: [{ name: 'tab', type: 'enterBackspaceTabSpace' }],
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A' },
    combo: [{ name: '!tab', type: 'enterBackspaceTabSpace' }],
  }))
  assert.not.ok(eventMatchesKeycombo({
    event: { key: 'A' },
    combo: [{ name: 'tab', type: 'enterBackspaceTabSpace' }],
  }))
  
  // Space
  assert.ok(eventMatchesKeycombo({
    event: { key: 'Space' },
    combo: [{ name: 'space', type: 'enterBackspaceTabSpace' }],
  }))
  assert.ok(eventMatchesKeycombo({
    event: { key: 'A' },
    combo: [{ name: '!space', type: 'enterBackspaceTabSpace' }],
  }))
  assert.not.ok(eventMatchesKeycombo({
    event: { key: 'A' },
    combo: [{ name: 'space', type: 'enterBackspaceTabSpace' }],
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

suite.run()
