import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { eventMatchesClickcombo } from '../../src/classes/Listenable'

const suite = createSuite('eventMatchesClickcombo (node)')

suite(`predicates click`, context => {
  assert.ok(eventMatchesClickcombo({
    event: {} as MouseEvent,
    combo: ['rightclick']
  }))
  assert.ok(eventMatchesClickcombo({
    event: {} as MouseEvent,
    combo: ['click']
  }))
  assert.ok(eventMatchesClickcombo({
    event: {} as MouseEvent,
    combo: ['mousedown']
  }))
  assert.ok(eventMatchesClickcombo({
    event: {} as MouseEvent,
    combo: ['mouseup']
  }))
})

suite(`predicates modifiers as modifiers`, context => {
  assert.ok(eventMatchesClickcombo({
    event: { shiftKey: true } as MouseEvent,
    combo: ['shift', 'click']
  }))
  assert.ok(eventMatchesClickcombo({
    event: { shiftKey: false } as MouseEvent,
    combo: ['!shift', 'click']
  }))
  
  assert.ok(eventMatchesClickcombo({
    event: { metaKey: true } as MouseEvent,
    combo: ['cmd', 'click']
  }))
  assert.ok(eventMatchesClickcombo({
    event: { metaKey: false } as MouseEvent,
    combo: ['!cmd', 'click']
  }))
  
  assert.ok(eventMatchesClickcombo({
    event: { ctrlKey: true } as MouseEvent,
    combo: ['ctrl', 'click']
  }))
  assert.ok(eventMatchesClickcombo({
    event: { ctrlKey: false } as MouseEvent,
    combo: ['!ctrl', 'click']
  }))
  
  assert.ok(eventMatchesClickcombo({
    event: { altKey: true } as MouseEvent,
    combo: ['alt', 'click']
  }))
  assert.ok(eventMatchesClickcombo({
    event: { altKey: false } as MouseEvent,
    combo: ['!alt', 'click']
  }))
  
  assert.ok(eventMatchesClickcombo({
    event: { altKey: true } as MouseEvent,
    combo: ['opt', 'click']
  }))
  assert.ok(eventMatchesClickcombo({
    event: { altKey: false } as MouseEvent,
    combo: ['!opt', 'click']
  }))
})

suite.run()
