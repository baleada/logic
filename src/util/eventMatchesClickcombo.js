import re from './re.js'
import isModified from './isModified.js'

export default function eventMatchesClickcombo ({ event, combo }) {
  return combo.every(name => (
    re.click.test(name)
    ||
    (name.startsWith('!') && !isModified({ alias: name.slice(1), event }))
    ||
    (!name.startsWith('!') && isModified({ alias: name, event }))
  ))
}
