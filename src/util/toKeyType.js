import re from './re.js'

assertionsByKeyType = new Map([
  [
    'singleCharacter',
    name => re.singleCharacter.test(name)
  ],
  [
    'arrow',
    name => re.arrow.test(name)
  ],
  [
    'enterBackspaceTabSpace',
    name => re.enterBackspaceTabSpace.test(name)
  ],
  [
    'modifier',
    name => re.modifier.test(name)
  ],
])

export default function toKeyType (name) {
  const { 0: keyType } = assertionsByKeyType
    .entries()
    .find(({ 1: assertion }) => assertion(name))
  return keyType
}
