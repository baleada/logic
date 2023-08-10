import type { KeyStatusKey } from './key-statuses'

export function fromAliasToDownKeys (alias: string): KeyStatusKey[] {
  if (alias in keysByAlias) {
    return [{ key: keysByAlias[alias] }]
  }

  if (alias in keyStatusKeysByAlias) return keyStatusKeysByAlias[alias]
  
  return [{
    code: (() => {
      if (letterRE.test(alias)) return `Key${alias.toUpperCase()}`
      if (digitRE.test(alias)) return `Digit${alias}`
      if (functionRE.test(alias)) return alias.toUpperCase()
      return 'unsupported'
    })(),
  }]
}

const digitRE = /^[0-9]$/
const letterRE = /^[a-zA-Z]$/
const functionRE = /^[fF][0-9]{1,2}$/

const keyStatusKeysByAlias: {
  [key: string]: KeyStatusKey[],
} = {
  '`': [{ code: 'Backquote' }],
  '~': [{ code: 'Backquote' }, { key: 'Shift' }],
  '-': [{ code: 'Minus' }],
  _: [{ code: 'Minus' }, { key: 'Shift' }],
  '=': [{ code: 'Equal' }],
  '+': [{ code: 'Equal' }, { key: 'Shift' }],
  '[': [{ code: 'BracketLeft' }],
  '{': [{ code: 'BracketLeft' }, { key: 'Shift' }],
  ']': [{ code: 'BracketRight' }],
  '}': [{ code: 'BracketRight' }, { key: 'Shift' }],
  '\\': [{ code: 'Backslash' }],
  '|': [{ code: 'Backslash' }, { key: 'Shift' }],
  ';': [{ code: 'Semicolon' }],
  ':': [{ code: 'Semicolon' }, { key: 'Shift' }],
  '\'': [{ code: 'Quote' }],
  '"': [{ code: 'Quote' }, { key: 'Shift' }],
  ',': [{ code: 'Comma' }],
  '<': [{ code: 'Comma' }, { key: 'Shift' }],
  '.': [{ code: 'Period' }],
  '>': [{ code: 'Period' }, { key: 'Shift' }],
  '/': [{ code: 'Slash' }],
  '?': [{ code: 'Slash' }, { key: 'Shift' }],
  '!': [{ code: 'Digit1' }, { key: 'Shift' }],
  '@': [{ code: 'Digit2' }, { key: 'Shift' }],
  '#': [{ code: 'Digit3' }, { key: 'Shift' }],
  $: [{ code: 'Digit4' }, { key: 'Shift' }],
  '%': [{ code: 'Digit5' }, { key: 'Shift' }],
  '^': [{ code: 'Digit6' }, { key: 'Shift' }],
  '&': [{ code: 'Digit7' }, { key: 'Shift' }],
  '*': [{ code: 'Digit8' }, { key: 'Shift' }],
  '(': [{ code: 'Digit9' }, { key: 'Shift' }],
  ')': [{ code: 'Digit0' }, { key: 'Shift' }],
  up: [{ code: 'ArrowUp' }],
  down: [{ code: 'ArrowDown' }],
  left: [{ code: 'ArrowLeft' }],
  right: [{ code: 'ArrowRight' }],
  enter: [{ code: 'Enter' }],
  space: [{ code: 'Space' }],
  tab: [{ code: 'Tab' }],
  esc: [{ code: 'Escape' }],
  backspace: [{ code: 'Backspace' }],
  delete: [{ code: 'Delete' }],
  home: [{ code: 'Home' }],
  end: [{ code: 'End' }],
  pagedown: [{ code: 'PageDown' }],
  pageup: [{ code: 'PageUp' }],
  capslock: [{ code: 'CapsLock' }],
  camera: [{ code: 'Camera' }],
}

const keysByAlias = {
  alt: 'Alt',
  opt: 'Alt',
  option: 'Alt',
  ctrl: 'Control',
  control: 'Control',
  meta: 'Meta',
  cmd: 'Meta',
  command: 'Meta',
  shift: 'Shift',
}
