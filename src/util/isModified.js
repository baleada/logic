const guardsByModifier = {
  shift: event => event.shiftKey,
  cmd: event => event.metaKey,
  ctrl: event => event.ctrlKey,
  alt: event => event.altKey,
  opt: event => event.altKey,
}

export default function isModified ({ event, alias }) {
  return guardsByModifier[alias]?.(event)
}


