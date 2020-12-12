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



suite.run()
