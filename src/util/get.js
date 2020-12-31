import toKeys from './toKeys.js'

export default function get ({ object, path }) {
  return toKeys(path).reduce((gotten, key) => gotten[key], object)
}
