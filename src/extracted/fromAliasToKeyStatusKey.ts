import type { KeyStatusKey } from './createKeyStatuses'

export function fromAliasToKeyStatusKey (alias: string): KeyStatusKey {
  if (alias in keysByAlias) {
    return { key: keysByAlias[alias] }
  }
  
  return {
    code: (() => {
      if (alias in codesByAlias) return codesByAlias[alias]
      if (letterRE.test(alias)) return `Key${alias.toUpperCase()}`
      if (digitRE.test(alias)) return `Digit${alias}`
      if (functionRE.test(alias)) return alias.toUpperCase()
      return 'unsupported'
    })(),
  }
}

const digitRE = /^[0-9]$/
const letterRE = /^[a-zA-Z]$/
const functionRE = /^[fF][0-9]{1,2}$/

const codesByAlias = {
  '`': 'Backquote',
  '~': 'Backquote',
  '-': 'Minus',
  _: 'Minus',
  '=': 'Equal',
  '+': 'Equal',
  '[': 'BracketLeft',
  '{': 'BracketLeft',
  ']': 'BracketRight',
  '}': 'BracketRight',
  '\\': 'Backslash',
  '|': 'Backslash',
  ';': 'Semicolon',
  ':': 'Semicolon',
  '\'': 'Quote',
  '"': 'Quote',
  ',': 'Comma',
  '<': 'Comma',
  '.': 'Period',
  '>': 'Period',
  '/': 'Slash',
  '?': 'Slash',
  '!': 'Digit1',
  '@': 'Digit2',
  '#': 'Digit3',
  $: 'Digit4',
  '%': 'Digit5',
  '^': 'Digit6',
  '&': 'Digit7',
  '*': 'Digit8',
  '(': 'Digit9',
  ')': 'Digit0',
  up: 'ArrowUp',
  down: 'ArrowDown',
  left: 'ArrowLeft',
  right: 'ArrowRight',
  enter: 'Enter',
  space: 'Space',
  tab: 'Tab',
  esc: 'Escape',
  backspace: 'Backspace',
  delete: 'Delete',
  home: 'Home',
  end: 'End',
  pagedown: 'PageDown',
  pageup: 'PageUp',
  capslock: 'CapsLock',
  camera: 'Camera',
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
