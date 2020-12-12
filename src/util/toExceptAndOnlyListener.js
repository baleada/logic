export default function toExceptAndOnlyListener (listener, options) {
  const { except = [], only = [] } = options
  
  return event => {
    const { target } = event,
          [matchesOnly, matchesExcept] = [only, except].map(selectors => selectors.some(selector => target.matches(selector)))

    if (matchesOnly) {
      listener(event)
    } else if (only.length === 0 && !matchesExcept) {
      listener(event)
    }
  }
}
