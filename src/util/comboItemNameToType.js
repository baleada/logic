export default function comboItemNameToType (name) {
  return [...guardsByType.keys()].find(type => guardsByType.get(type)(name)) ?? 'custom'
}

const guardsByType = new Map([
        [
          'singleCharacter',
          name => re.singleCharacter.test(name)
        ],
        [
          'arrow',
          name => re.arrow.test(name)
        ],
        [
          'other',
          name => re.other.test(name)
        ],
        [
          'modifier',
          name => re.modifier.test(name)
        ],
        [
          'click',
          name => re.click.test(name)
        ],
      ]),
      re = {
        singleCharacter: /^!?[a-zA-Z0-9,<.>/?;:'"[{\]}\\|`~!@#$%^&*()-_=+]$/,
        arrow: /^!?(arrow|vertical|horizontal|up|down|right|left)$/,
        other: /^!?(enter|backspace|space|tab|esc|home|end|pagedown|pageup|capslock|f[0-9]{1,2}|camera|delete)$/,
        modifier: /^!?(cmd|command|meta|shift|ctrl|control|alt|opt)$/,
        click: /^(rightclick|click|mousedown|mouseup)$/,
      }
