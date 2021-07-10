import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { eventMatchesClickcombo } from '../../src/classes/Listenable'

const suite = createSuite('eventMatchesClickcombo (node)')

suite(`predicates click`, context => {
  assert.ok(eventMatchesClickcombo({
    event: {} as MouseEvent,
    clickcombo: ['rightclick']
  }))
  assert.ok(eventMatchesClickcombo({
    event: {} as MouseEvent,
    clickcombo: ['click']
  }))
  assert.ok(eventMatchesClickcombo({
    event: {} as MouseEvent,
    clickcombo: ['mousedown']
  }))
  assert.ok(eventMatchesClickcombo({
    event: {} as MouseEvent,
    clickcombo: ['mouseup']
  }))
  assert.ok(eventMatchesClickcombo({
    event: {} as MouseEvent,
    clickcombo: ['contextmenu']
  }))
})

suite(`predicates modifiers as modifiers`, context => {
  assert.ok(eventMatchesClickcombo({
    event: { shiftKey: true } as MouseEvent,
    clickcombo: ['shift', 'click']
  }))
  assert.ok(eventMatchesClickcombo({
    event: { shiftKey: false } as MouseEvent,
    clickcombo: ['!shift', 'click']
  }))
  
  assert.ok(eventMatchesClickcombo({
    event: { metaKey: true } as MouseEvent,
    clickcombo: ['cmd', 'click']
  }))
  assert.ok(eventMatchesClickcombo({
    event: { metaKey: false } as MouseEvent,
    clickcombo: ['!cmd', 'click']
  }))
  
  assert.ok(eventMatchesClickcombo({
    event: { ctrlKey: true } as MouseEvent,
    clickcombo: ['ctrl', 'click']
  }))
  assert.ok(eventMatchesClickcombo({
    event: { ctrlKey: false } as MouseEvent,
    clickcombo: ['!ctrl', 'click']
  }))
  
  assert.ok(eventMatchesClickcombo({
    event: { altKey: true } as MouseEvent,
    clickcombo: ['alt', 'click']
  }))
  assert.ok(eventMatchesClickcombo({
    event: { altKey: false } as MouseEvent,
    clickcombo: ['!alt', 'click']
  }))
  
  assert.ok(eventMatchesClickcombo({
    event: { altKey: true } as MouseEvent,
    clickcombo: ['opt', 'click']
  }))
  assert.ok(eventMatchesClickcombo({
    event: { altKey: false } as MouseEvent,
    clickcombo: ['!opt', 'click']
  }))
})

suite.run()
