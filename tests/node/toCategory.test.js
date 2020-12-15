import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import toCategory from '../../src/util/toCategory.js'

const suite = createSuite('toCategory (node)')

suite(`predicates recognizeable`, context => {
  const value = toCategory('recognizeable'),
        expected = 'recognizeable'
  
  assert.is(value, expected)
})

suite(`predicates observation`, context => {
  const values = [
          toCategory('intersect'),
          toCategory('resize'),
          toCategory('mutate'),
        ],
        expected = 'observation'
  
  assert.ok(values.every(value => value === expected))
})

suite(`predicates mediaquery`, context => {
  const value = toCategory('(min-width: 600px)'),
        expected = 'mediaquery'
  
  assert.is(value, expected)
})

suite(`predicates idle`, context => {
  const value = toCategory('idle'),
        expected = 'idle'
  
  assert.is(value, expected)
})

suite(`predicates visibilitychange`, context => {
  const value = toCategory('visibilitychange'),
        expected = 'visibilitychange'
  
  assert.is(value, expected)
})

suite(`predicates keycombo`, context => {
  const stubs = [
          'cmd+b',
          'shift+cmd+b',
          'shift+alt+cmd+b',
          'shift+ctrl+alt+cmd+b',
          'arrow',
          'horizontal',
          'vertical',
          'up',
          'down',
          'left',
          'right',
          'enter',
          'backspace',
          'space',
          'tab',
          'esc',
          'home',
          'end',
          'pagedown',
          'pageup',
          'capslock',
          'f1',
          'camera',
          '1',
          'b',
          'cmd',
          '1+a+enter',
          '/',
          '+',
          '!a',
          '!1',
          '!enter',
          '!shift',
          '!up',
          '!/',
          '!!',
        ],
        expected = 'keycombo'
  
  assert.ok(stubs.every(stub => toCategory(stub) === expected))
})

suite(`predicates leftclickcombo`, context => {
  const stubs = [
          'click',
          'mousedown',
          'mouseup',
          'cmd+click',
          'shift+cmd+click',
          'shift+alt+cmd+click',
          'shift+ctrl+alt+cmd+click',
          '!shift+click',
        ],
        expected = 'leftclickcombo'
  
  assert.ok(stubs.every(stub => toCategory(stub) === expected))
})

suite(`predicates rightclickcombo`, context => {
  const stubs = [
          'cmd+rightclick',
          'cmd+rightclick',
          'shift+cmd+rightclick',
          'shift+alt+cmd+rightclick',
          'shift+ctrl+alt+cmd+rightclick',
          '!shift+rightclick',
        ],
        expected = 'rightclickcombo'
  
  assert.ok(stubs.every(stub => toCategory(stub) === expected))
})

suite(`predicates event`, context => {
  const stubs = [
          'change',
          'custom event',

          // A custom delimiter would allow support for custom events
          // with plus symbols in their name.

          // toCategory('custom+event'),
        ],
        expected = 'event'
  
  assert.ok(stubs.every(stub => toCategory(stub) === expected))
})

suite.run()
