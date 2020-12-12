import toModifier from './toModifier.js'
import isModified from './isModified.js'

export default function fromKeysToMatches ({ event, keys }) {
  keys.every(({ name, type }, index) => {
    switch (type) {
      case 'singleCharacter':
      case 'enterBackspaceTabSpace':
        return name.startsWith('!') && name.length === 2
          ? event.key.toLowerCase() !== name.toLowerCase()
          : event.key.toLowerCase() === name.toLowerCase()
      case 'arrow':
        return toMatchesByArrow[name]?.({ event, name }) ?? toMatchesByArrow.default({ event, name })
      case 'modifier':
        if (index === keys.length - 1) {
          return name.startsWith('!')
            ? event.key.toLowerCase() !== toModifier(name).toLowerCase()
            : event.key.toLowerCase() === toModifier(name).toLowerCase()
        }

        return name.startsWith('!')
          ? !isModified({ alias: name, event })
          : isModified({ alias: name, event })
    }
  })
}

const toMatchesByArrow = {
  'arrow': ({ event }) => ['arrowup', 'arrowright', 'arrowdown', 'arrowleft'].includes(event.key.toLowerCase()),
  '!arrow': ({ event }) => !['arrowup', 'arrowright', 'arrowdown', 'arrowleft'].includes(event.key.toLowerCase()),
  'vertical': ({ event }) => ['arrowup', 'arrowdown'].includes(event.key.toLowerCase()),
  '!vertical': ({ event }) => !['arrowup', 'arrowdown'].includes(event.key.toLowerCase()),
  'horizontal': ({ event }) => ['arrowright', 'arrowleft'].includes(event.key.toLowerCase()),
  '!horizontal': ({ event }) => !['arrowright', 'arrowleft'].includes(event.key.toLowerCase()),
  'default': ({ event, name }) => name.startsWith('!')
    ? event.key.toLowerCase() !== `arrow${name.toLowerCase()}`
    : event.key.toLowerCase() === `arrow${name.toLowerCase()}`,
}
