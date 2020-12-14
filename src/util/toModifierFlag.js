const flagsByAlias = {
  shift: 'shiftKey',
  cmd: 'metaKey',
  ctrl: 'ctrlKey',
  alt: 'altKey',
  opt: 'altKey',
}

export default function toModifierFlag (alias) {
  return flagsByAlias[alias]
}
