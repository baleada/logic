import re from './re.js'
import isModified from './isModified.js'

export default function eventMatchesClickcombo ({ event, keys }) {
  return keys.every(name => (
    re.click.test(name)
    ||
    (isModified({ alias: name, event }) && !name.startsWith('!'))
    ||
    (!isModified({ alias: name, event }) && name.startsWith('!'))
  ))
}
