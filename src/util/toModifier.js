const modifiersByAlias = {
  cmd: 'meta',
  command: 'meta',
  ctrl: 'control',
  opt: 'alt',
}

// type Alias = 'cmd' | 'command' | 'meta' | 'shift' | 'ctrl' | 'control' | 'alt' | 'opt'
// type Modifier = 'meta' | 'command' | 'control' | 'alt' | 'shift'

export default function toModifier (alias) {
  return modifiersByAlias[alias] || alias
}
