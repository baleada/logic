export default function capitalize (word) {
  return word.length > 0 ? `${word[0].toUpperCase()}${word.slice(1)}` : word
}
