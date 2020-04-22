import nextMatch from './nextMatch'

export default function lastMatch ({ string, expression, from }) {
  // VALIDATE: from is 0...string.length

  let indexOf
  if (!expression.test(string.slice(0, from)) || from === 0) {
    indexOf = -1
  } else {
    const reversedStringBeforeFrom = string
            .slice(0, from)
            .split('')
            .reverse()
            .join(''),
          nextMatchIndex = nextMatch({ string: reversedStringBeforeFrom, expression, from: 0 })
    
    indexOf = nextMatchIndex === -1
      ? -1
      : (reversedStringBeforeFrom.length - 1) - nextMatchIndex
  }

  return indexOf
}
