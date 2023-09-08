import { createClip } from '../pipes/string'

export function fromEventToAliases (event: KeyboardEvent): string[] {
  if (event.shiftKey && event.code in aliasesByShiftCode) return [aliasesByShiftCode[event.code]]

  if (event.key in aliasListsByModifier) return aliasListsByModifier[event.key]
  const withoutModifierSide = toWithoutModifierSide(event.code)
  if (withoutModifierSide in aliasListsByModifier) return aliasListsByModifier[withoutModifierSide]

  return event.code in aliasesByCode
    ? [aliasesByCode[event.code]]
    : [event.code.match(aliasCaptureRE)?.[1].toLowerCase() || 'unsupported']
}

const toWithoutModifierSide = createClip(/(?:Left|Right)$/)
const aliasCaptureRE = /^(?:Digit|Key)?(F[0-9]{1,2}|[0-9]|[A-Z])$/

export const aliasesByCode = {
  Backquote: '`',
  Minus: '-',
  Equal: '=',
  BracketLeft: '[',
  BracketRight: ']',
  Backslash: '\\',
  Semicolon: ';',
  Quote: '\'',
  Comma: ',',
  Period: '.',
  Slash: '/',
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  Enter: 'enter',
  Space: 'space',
  Tab: 'tab',
  Escape: 'esc',
  Backspace: 'backspace',
  Delete: 'delete',
  Home: 'home',
  End: 'end',
  PageDown: 'pagedown',
  PageUp: 'pageup',
  CapsLock: 'capslock',
  Camera: 'camera',
}

export const aliasesByShiftCode = {
  Backquote: '~',
  Minus: '_',
  Equal: '+',
  BracketLeft: '{',
  BracketRight: '}',
  Backslash: '|',
  Semicolon: ':',
  Quote: '"',
  Comma: '<',
  Period: '>',
  Slash: '?',
  Digit1: '!',
  Digit2: '@',
  Digit3: '#',
  Digit4: '$',
  Digit5: '%',
  Digit6: '^',
  Digit7: '&',
  Digit8: '*',
  Digit9: '(',
  Digit0: ')',
}

export const aliasListsByModifier = {
  Alt: ['alt', 'option', 'opt'],
  Control: ['control', 'ctrl'],
  Meta: ['meta', 'command', 'cmd'],
  Shift: ['shift'],
}
