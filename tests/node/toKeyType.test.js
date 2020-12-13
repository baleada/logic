import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import toKeyType from '../../src/util/toKeyType.js'

const suite = createSuite('toKeyType (node)')

suite(`predicates singleCharacter`, context => {
  const expected = 'singleCharacter',
        stubs = [
          'A', 'a', '7', ',', '<', '.', '>', '/', '?', ';', ':', `'`, '"', '[', '{', ']', '}', '\\', '|', '`', '~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '_', '=', '+',
          '!A', '!a', '!7', '!,', '!<', '!.', '!>', '!/', '!?', '!;', '!:', `!'`, '!"', '![', '!{', '!]', '!}', '!\\', '!|', '!`', '!~', '!!', '!@', '!#', '!$', '!%', '!^', '!&', '!*', '!(', '!)', '!-', '!_', '!=', '!+',
        ]
  
  stubs.forEach(value => assert.is(toKeyType(value), expected))
})

suite(`predicates arrow`, context => {
  const expected = 'arrow',
        stubs = [
          'arrow', 'vertical', 'horizontal', 'up', 'down', 'right', 'left',
          '!arrow', '!vertical', '!horizontal', '!up', '!down', '!right', '!left',
        ]
  
  stubs.forEach(value => assert.is(toKeyType(value), expected))
})

suite(`predicates enterBackspaceTabSpace`, context => {
  const expected = 'enterBackspaceTabSpace',
        stubs = [
          'enter', 'backspace', 'tab', 'space',
          '!enter', '!backspace', '!tab', '!space',
        ]
  
  stubs.forEach(value => assert.is(toKeyType(value), expected))
})

suite(`predicates modifier`, context => {
  const expected = 'modifier',
        stubs = [
          'cmd', 'shift', 'ctrl', 'alt', 'opt',
          '!cmd', '!shift', '!ctrl', '!alt', '!opt',
        ]

  stubs.forEach(value => assert.is(toKeyType(value), expected))
})

suite.run()
