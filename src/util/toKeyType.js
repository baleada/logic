import re from './re.js'

const guardsByKeyType = new Map([
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
  return [...guardsByKeyType.keys()]
    .find(keyType => guardsByKeyType.get(keyType)(name))
}
