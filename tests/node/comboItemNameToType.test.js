import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import comboItemNameToType from '../../src/util/comboItemNameToType.js'

const suite = createSuite('comboItemNameToType (node)')

suite(`predicates singleCharacter`, context => {
  const expected = 'singleCharacter',
        stubs = [
          'A', 'a', '7', ',', '<', '.', '>', '/', '?', ';', ':', `'`, '"', '[', '{', ']', '}', '\\', '|', '`', '~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '_', '=', '+',
          '!A', '!a', '!7', '!,', '!<', '!.', '!>', '!/', '!?', '!;', '!:', `!'`, '!"', '![', '!{', '!]', '!}', '!\\', '!|', '!`', '!~', '!!', '!@', '!#', '!$', '!%', '!^', '!&', '!*', '!(', '!)', '!-', '!_', '!=', '!+',
        ]
  
  stubs.forEach(value => assert.is(comboItemNameToType(value), expected))
})

suite(`predicates arrow`, context => {
  const expected = 'arrow',
        stubs = [
          'arrow', 'vertical', 'horizontal', 'up', 'down', 'right', 'left',
          '!arrow', '!vertical', '!horizontal', '!up', '!down', '!right', '!left',
        ]
  
  stubs.forEach(value => assert.is(comboItemNameToType(value), expected))
})

suite(`predicates other`, context => {
  const expected = 'other',
        stubs = [
          'enter', 'backspace', 'tab', 'space', 'esc',
          '!enter', '!backspace', '!tab', '!space', '!esc',
        ]
  
  stubs.forEach(value => assert.is(comboItemNameToType(value), expected))
})

suite(`predicates modifier`, context => {
  const expected = 'modifier',
        stubs = [
          'cmd', 'shift', 'ctrl', 'alt', 'opt',
          '!cmd', '!shift', '!ctrl', '!alt', '!opt',
        ]

  stubs.forEach(value => assert.is(comboItemNameToType(value), expected))
})

suite(`predicates click`, context => {
  const expected = 'click',
        stubs = [
          'rightclick', 'click', 'mousedown', 'mouseup',
        ]

  stubs.forEach(value => assert.is(comboItemNameToType(value), expected))
})

suite(`predicates custom`, context => {
  const expected = 'custom',
        stubs = [
          'stub',
        ]

  stubs.forEach(value => assert.is(comboItemNameToType(value), expected))
})

suite.run()
