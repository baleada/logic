import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { eventMatchesClickcombo } from '../../src/classes/Listenable'

const suite = createSuite('eventMatchesClickcombo (node)')

suite(`predicates click`, context => {
  assert.ok(eventMatchesClickcombo({
    event: {},
    combo: ['rightclick']
  }))
  assert.ok(eventMatchesClickcombo({
    event: {},
    combo: ['click']
  }))
  assert.ok(eventMatchesClickcombo({
    event: {},
    combo: ['mousedown']
  }))
  assert.ok(eventMatchesClickcombo({
    event: {},
    combo: ['mouseup']
  }))
})

suite(`predicates modifiers as modifiers`, context => {
  assert.ok(eventMatchesClickcombo({
    event: { shiftKey: true },
    combo: ['shift', 'click']
  }))
  assert.ok(eventMatchesClickcombo({
    event: { shiftKey: false },
    combo: ['!shift', 'click']
  }))
  
  assert.ok(eventMatchesClickcombo({
    event: { metaKey: true },
    combo: ['cmd', 'click']
  }))
  assert.ok(eventMatchesClickcombo({
    event: { metaKey: false },
    combo: ['!cmd', 'click']
  }))
  
  assert.ok(eventMatchesClickcombo({
    event: { ctrlKey: true },
    combo: ['ctrl', 'click']
  }))
  assert.ok(eventMatchesClickcombo({
    event: { ctrlKey: false },
    combo: ['!ctrl', 'click']
  }))
  
  assert.ok(eventMatchesClickcombo({
    event: { altKey: true },
    combo: ['alt', 'click']
  }))
  assert.ok(eventMatchesClickcombo({
    event: { altKey: false },
    combo: ['!alt', 'click']
  }))
  
  assert.ok(eventMatchesClickcombo({
    event: { altKey: true },
    combo: ['opt', 'click']
  }))
  assert.ok(eventMatchesClickcombo({
    event: { altKey: false },
    combo: ['!opt', 'click']
  }))
})

suite.run()
