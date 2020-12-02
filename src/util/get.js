export default function get ({ object, path }) {
  return toKeys(path).reduce((gotten, key) => gotten[key], object)
}

export function toKeys (path) {
  return path
    .split('.')
    .map(key => isNaN(Number(key)) ? key : Number(key))
}
