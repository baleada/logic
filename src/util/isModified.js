const fnsByModifier = {
  shift: event => event.shiftKey,
  cmd: event => event.metaKey,
  ctrl: event => event.ctrlKey,
  alt: event => event.altKey,
  opt: event => event.altKey,
}

export default function isModified ({ event, alias }) {
  return fnsByModifier[alias](event)
}


