import { createClip } from '../pipes'

export function fromCodeToSingleCharacter (code: KeyboardEvent['code']): string {
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
    if (c === code) {
      return aliasesByCode[c]
    }
  }

  for (const prefix of ['Key', 'Digit']) {
    const re = new RegExp(`^${prefix}`)
    if (re.test(code)) {
      return createClip(re)(code).toLowerCase()
    }
  }

  return code
}
