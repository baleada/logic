import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { toKey } from '../../src/extracted'

const suite = createSuite('toKey')

suite(`transforms aliases to keys`, context => {
  (() => {
    const value = toKey('up'),
          expected = 'ArrowUp'

    assert.is(value, expected)
  })();

  (() => {
    const value = toKey('right'),
          expected = 'ArrowRight'

    assert.is(value, expected)
  })();

  (() => {
    const value = toKey('down'),
          expected = 'ArrowDown'

    assert.is(value, expected)
  })();

  (() => {
    const value = toKey('left'),
          expected = 'ArrowLeft'

    assert.is(value, expected)
  })();

  (() => {
    const value = toKey('enter'),
          expected = 'Enter'

    assert.is(value, expected)
  })();

  (() => {
    const value = toKey('backspace'),
          expected = 'Backspace'

    assert.is(value, expected)
  })();

  (() => {
    const value = toKey('tab'),
          expected = 'Tab'

    assert.is(value, expected)
  })();

  (() => {
    const value = toKey('space'),
          expected = ' '

    assert.is(value, expected)
  })();

  (() => {
    const value = toKey('shift'),
          expected = 'Shift'

    assert.is(value, expected)
  })();

  (() => {
    const value = toKey('meta'),
          expected = 'Meta'

    assert.is(value, expected)
  })();

  (() => {
    const value = toKey('command'),
          expected = 'Meta'

    assert.is(value, expected)
  })();

  (() => {
    const value = toKey('cmd'),
          expected = 'Meta'

    assert.is(value, expected)
  })();

  (() => {
    const value = toKey('control'),
          expected = 'Control'

    assert.is(value, expected)
  })();

  (() => {
    const value = toKey('ctrl'),
          expected = 'Control'

    assert.is(value, expected)
  })();

  (() => {
    const value = toKey('alt'),
          expected = 'Alt'

    assert.is(value, expected)
  })();

  (() => {
    const value = toKey('opt'),
          expected = 'Alt'

    assert.is(value, expected)
  })();

  (() => {
    const value = toKey('option'),
          expected = 'Alt'

    assert.is(value, expected)
  })();

  (() => {
    const value = toKey('fn'),
          expected = 'Fn'

    assert.is(value, expected)
  })();

  (() => {
    const value = toKey('capslock'),
          expected = 'CapsLock'

    assert.is(value, expected)
  })();

  (() => {
    const value = toKey('end'),
          expected = 'End'

    assert.is(value, expected)
  })();

  (() => {
    const value = toKey('home'),
          expected = 'Home'

    assert.is(value, expected)
  })();

  (() => {
    const value = toKey('pagedown'),
          expected = 'PageDown'

    assert.is(value, expected)
  })();

  (() => {
    const value = toKey('pageup'),
          expected = 'PageUp'

    assert.is(value, expected)
  })();

  (() => {
    const value = toKey('esc'),
          expected = 'Escape'

    assert.is(value, expected)
  })();

  (() => {
    const value = toKey('camera'),
          expected = 'Camera'

    assert.is(value, expected)
  })();

  (() => {
    const value = toKey('delete'),
          expected = 'Delete'

    assert.is(value, expected)
  })();

  (() => {
    const value = toKey('f1'),
          expected = 'F1'

    assert.is(value, expected)
  })();

  (() => {
    const value = toKey('f2'),
          expected = 'F2'

    assert.is(value, expected)
  })();

  (() => {
    const value = toKey('f3'),
          expected = 'F3'

    assert.is(value, expected)
  })();

  (() => {
    const value = toKey('f4'),
          expected = 'F4'

    assert.is(value, expected)
  })();

  (() => {
    const value = toKey('f5'),
          expected = 'F5'

    assert.is(value, expected)
  })();

  (() => {
    const value = toKey('f6'),
          expected = 'F6'

    assert.is(value, expected)
  })();

  (() => {
    const value = toKey('f7'),
          expected = 'F7'

    assert.is(value, expected)
  })();

  (() => {
    const value = toKey('f8'),
          expected = 'F8'

    assert.is(value, expected)
  })();

  (() => {
    const value = toKey('f9'),
          expected = 'F9'

    assert.is(value, expected)
  })();

  (() => {
    const value = toKey('f10'),
          expected = 'F10'

    assert.is(value, expected)
  })();

  (() => {
    const value = toKey('f11'),
          expected = 'F11'

    assert.is(value, expected)
  })();

  (() => {
    const value = toKey('f12'),
          expected = 'F12'

    assert.is(value, expected)
  })();

  (() => {
    const value = toKey('f13'),
          expected = 'F13'

    assert.is(value, expected)
  })();

  (() => {
    const value = toKey('f14'),
          expected = 'F14'

    assert.is(value, expected)
  })();

  (() => {
    const value = toKey('f15'),
          expected = 'F15'

    assert.is(value, expected)
  })();

  (() => {
    const value = toKey('f16'),
          expected = 'F16'

    assert.is(value, expected)
  })();

  (() => {
    const value = toKey('f17'),
          expected = 'F17'

    assert.is(value, expected)
  })();

  (() => {
    const value = toKey('f18'),
          expected = 'F18'

    assert.is(value, expected)
  })();

  (() => {
    const value = toKey('f19'),
          expected = 'F19'

    assert.is(value, expected)
  })();

  (() => {
    const value = toKey('f20'),
          expected = 'F20'

    assert.is(value, expected)
  })();
})

suite.run()
