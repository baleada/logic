import { createClip } from '../pipes'
import type { KeycomboItem } from './keycombo'

export function toName (code: KeyboardEvent['code']): KeycomboItem['name'] {
  const aliasesByCode = {
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
  }

  for (const c in aliasesByCode) {
    if (c === code) return aliasesByCode[c]
  }

  for (const re of [keyRE, digitRE, directionRE]) {
    if (re.test(code)) return createClip(re)(code).toLowerCase()
  }

  return code.toLowerCase()
}

const keyRE = /^Key/
const digitRE = /^Digit/
const directionRE = /(?:Right|Left)$/
