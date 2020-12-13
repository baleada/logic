export default function toKeyType (name) {
  return [...guardsByKeyType.keys()]
    .find(keyType => guardsByKeyType.get(keyType)(name))
}

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
]),
re = {
  singleCharacter:
    /^!?[a-zA-Z0-9,<.>/?;:'"[{\]}\\|`~!@#$%^&*()-_=+]$/,
  arrow:
    /^!?(arrow|vertical|horizontal|up|down|right|left)$/,
  enterBackspaceTabSpace:
    /^!?(enter|backspace|tab|space)$/,
  modifier:
    /^!?(cmd|shift|ctrl|alt|opt)$/,
}
