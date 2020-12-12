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
  const values = [
          toCategory('cmd+b'),
          toCategory('shift+cmd+b'),
          toCategory('shift+alt+cmd+b'),
          toCategory('shift+ctrl+alt+cmd+b'),
          toCategory('arrow'),
          toCategory('horizontal'),
          toCategory('vertical'),
          toCategory('up'),
          toCategory('down'),
          toCategory('left'),
          toCategory('right'),
          toCategory('enter'),
          toCategory('backspace'),
          toCategory('tab'),
          toCategory('space'),
          toCategory('1'),
          toCategory('b'),
          toCategory('cmd'),
          toCategory('1+a+enter'),
          toCategory('/'),
          toCategory('+'),
          toCategory('!a'),
          toCategory('!1'),
          toCategory('!enter'),
          toCategory('!shift'),
          toCategory('!up'),
          toCategory('!/'),
          toCategory('!!')
        ],
        expected = 'keycombo'
  
  assert.ok(values.every(value => value === expected))
})

suite(`predicates leftclickcombo`, context => {
  const values = [
          toCategory('click'),
          toCategory('mousedown'),
          toCategory('mouseup'),
          toCategory('cmd+click'),
          toCategory('shift+cmd+click'),
          toCategory('shift+alt+cmd+click'),
          toCategory('shift+ctrl+alt+cmd+click'),
          toCategory('!shift+click'),
        ],
        expected = 'leftclickcombo'
  
  assert.ok(values.every(value => value === expected))
})

suite(`predicates rightclickcombo`, context => {
  const values = [
          toCategory('cmd+rightclick'),
          toCategory('cmd+rightclick'),
          toCategory('shift+cmd+rightclick'),
          toCategory('shift+alt+cmd+rightclick'),
          toCategory('shift+ctrl+alt+cmd+rightclick'),
          toCategory('!shift+rightclick'),
        ],
        expected = 'rightclickcombo'
  
  assert.ok(values.every(value => value === expected))
})

suite(`predicates event`, context => {
  const values = [
          toCategory('change'),
          toCategory('custom event'),

          // A custom delimiter would allow support for custom events
          // with plus symbols in their name.

          // toCategory('custom+event'),
        ],
        expected = 'event'
  
  assert.ok(values.every(value => value === expected))
})

suite.run()
