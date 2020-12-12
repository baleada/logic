import toModifier from './toModifier.js'
import isModified from './isModified.js'

export default function eventMatchesKeycombo ({ event, combo }) {
  return combo.every(({ name, type }, index) => {
    switch (type) {
      case 'singleCharacter':
      case 'enterBackspaceTabSpace':
        if (name === '!') {
          return event.key === '!'
        }

        return name.startsWith('!')
          ? event.key.toLowerCase() !== name.slice(1).toLowerCase()
          : event.key.toLowerCase() === name.toLowerCase()
      case 'arrow':
        return guardsByArrow[name]?.({ event, name }) ?? guardsByArrow.default({ event, name })
      case 'modifier':
        if (index === combo.length - 1) {
          return name.startsWith('!')
            ? event.key.toLowerCase() !== toModifier(name).toLowerCase()
            : event.key.toLowerCase() === toModifier(name).toLowerCase()
        }

        return name.startsWith('!')
          ? !isModified({ event, alias: name })
          : isModified({ event, alias: name })
    }
  })
}

const guardsByArrow = {
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
