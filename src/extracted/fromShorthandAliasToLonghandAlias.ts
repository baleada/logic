export function fromShorthandAliasToLonghandAlias (shorthand: string) {
  if (capitalLetterRE.test(shorthand)) return `shift+${shorthand.toLowerCase()}`
  if (shorthand in keycombosBySpecialCharacter) return keycombosBySpecialCharacter[shorthand]
  return shorthand
}

const capitalLetterRE = /^[A-Z]$/
const keycombosBySpecialCharacter: {
  [key: string]: string,
} = {
  '~': 'shift+`',
  _: 'shift+-',
  '+': 'shift+=',
  '{': 'shift+[',
  '}': 'shift+]',
  '|': 'shift+\\',
  ':': 'shift+;',
  '"': 'shift+\'',
  '<': 'shift+,',
  '>': 'shift+.',
  '?': 'shift+/',
  '!': 'shift+1',
  '@': 'shift+2',
  '#': 'shift+3',
  $: 'shift+4',
  '%': 'shift+5',
  '^': 'shift+6',
  '&': 'shift+7',
  '*': 'shift+8',
  '(': 'shift+9',
  ')': 'shift+0',
}
