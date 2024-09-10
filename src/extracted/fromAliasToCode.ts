import type { KeyStatusCode } from './key-statuses'

export function fromAliasToCode (alias: string): KeyStatusCode {
  if (alias in partialCodesByAlias) return partialCodesByAlias[alias]

  if (alias in keyStatusKeysByAlias) return keyStatusKeysByAlias[alias]

  if (letterRE.test(alias)) return `Key${alias.toUpperCase()}`
  if (digitRE.test(alias)) return `Digit${alias}`
  if (functionRE.test(alias)) return alias.toUpperCase()

  return 'unsupported'
}

const digitRE = /^[0-9]$/
const letterRE = /^[a-zA-Z]$/
const functionRE = /^[fF][0-9]{1,2}$/

const keyStatusKeysByAlias: {
  [key: string]: KeyStatusCode,
} = {
  '`': 'Backquote',
  '-': 'Minus',
  '=': 'Equal',
  '[': 'BracketLeft',
  ']': 'BracketRight',
  '\\': 'Backslash',
  ';': 'Semicolon',
  '\'': 'Quote',
  ',': 'Comma',
  '.': 'Period',
  '/': 'Slash',
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

const partialCodesByAlias = {
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
