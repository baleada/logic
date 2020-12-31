export default function toKeys (path) {
  return path
    .split('.')
    .map(key => isNaN(Number(key)) ? key : Number(key))
}
