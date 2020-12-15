import comboItemNameToType from './comboItemNameToType.js'
import toKey from './toKey.js'
import toModifierFlag from './toModifierFlag.js'

export default function toEvent ({ combo, direction }, init) {
  const modifiers = combo.slice(0, combo.length - 1),
        { 0: name } = combo.slice(combo.length - 1),
        type = comboItemNameToType(name)

  switch (type) {
    case 'singleCharacter':
    case 'other':
    case 'modifier':
      return new KeyboardEvent(
        `key${direction}`,
        {
          ...init,
          key: toKey(name),
          ...modifiers.reduce((flags, alias) => ({ ...flags, [toModifierFlag(alias)]: true }), {})
        }
      )
    case 'click':
      return new MouseEvent(
        name === 'rightclick' ? 'contextmenu' : name,
        {
          ...init,
          ...modifiers.reduce((flags, alias) => ({ ...flags, [toModifierFlag(alias)]: true }), {})
        }
      )
    case 'custom':
      return new Event(
        name,
        init
      )
  }
}
