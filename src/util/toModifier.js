modifiersByAlias = {
  shift: 'shift',
  cmd: 'meta',
  ctrl: 'control',
  alt: 'alt',
  opt: 'alt',
}

export default function toModifier (alias) {
  return modifiersByAlias[aliasOrEvent]
}
