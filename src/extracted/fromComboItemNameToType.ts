import { find } from 'lazy-collections'

export type ComboItemType = 'singleCharacter' | 'arrow' | 'other' | 'modifier' | 'click' | 'pointer'

export function fromComboItemNameToType (name: string) {
  const predicatesByType: Record<ComboItemType, (name: string) => boolean> = {
    singleCharacter: name => typeREs['singleCharacter'].test(name),
    arrow: name => typeREs['arrow'].test(name),
    other: name => typeREs['other'].test(name),
    modifier: name => typeREs['modifier'].test(name),
    click: name => typeREs['click'].test(name),
    pointer: name => typeREs['pointer'].test(name),
  }

  const comboItemTypes = new Set<ComboItemType>(['singleCharacter', 'arrow', 'other', 'modifier', 'click', 'pointer'])

  return find(
    (type: ComboItemType) => predicatesByType[type](name)
  )(comboItemTypes) as ComboItemType ?? 'custom'
}

const typeREs: Record<ComboItemType, RegExp> = {
  singleCharacter: /^!?[a-zA-Z0-9,<.>/?;:'"[{\]}\\|`~!@#$%^&*()-_=+]$/,
  arrow: /^!?(arrow|vertical|horizontal|up|down|right|left)$/,
  other: /^!?(enter|backspace|space|tab|esc|home|end|pagedown|pageup|capslock|f[0-9]{1,2}|camera|delete)$/,
  modifier: /^!?(cmd|command|meta|shift|ctrl|control|alt|opt|option)$/,
  click: /^!?(rightclick|contextmenu|click|mousedown|mouseup|dblclick)$/,
  pointer: /^!?(pointerdown|pointerup|pointermove|pointerover|pointerout|pointerenter|pointerleave|pointercancel|gotpointercapture|lostpointercapture)$/,
}
