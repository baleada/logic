function lastMatch (string, regexp, fromIndex) {
  if (fromIndex === undefined || fromIndex > string.length) fromIndex = string.length - 1
  let indexOf

  if (!regexp.test(string.slice(0, fromIndex)) || fromIndex === 0) {
    indexOf = -1
  } else {
    let i = fromIndex - 1
    while (i > -1 && indexOf === undefined) {
      indexOf = (regexp.test(string[i])) ? i : undefined
      i--
    }

    if (indexOf === undefined) indexOf = -1
  }

  return indexOf
}

export default lastMatch
