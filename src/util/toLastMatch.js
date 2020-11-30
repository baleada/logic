import toNextMatch from './toNextMatch.js'

export default function toLastMatch ({ string, expression, from }) {
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
          toNextMatchIndex = toNextMatch({ string: reversedStringBeforeFrom, expression, from: 0 })
    
    indexOf = toNextMatchIndex === -1
      ? -1
      : (reversedStringBeforeFrom.length - 1) - toNextMatchIndex
  }

  return indexOf
}
