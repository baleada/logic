export default function nextMatch ({ string, expression, from }) {
  // VALIDATE: from is 0...string.length

  const searchResult = string.slice(from).search(expression),
        indexOf = searchResult === -1
          ? -1
          : from + searchResult

  return indexOf
}
