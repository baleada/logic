import { createUnique } from '../pipes/index.js'

export default function toCombo (type, delimiter = '+') {
  // If the delimiter is used as a character in the type,
  // two empty strings will be produced by the split.
  // Uniqueable ensures those two are combined into one.
  return createUnique()(type.split(delimiter))
    .map(name => (name === '' ? delimiter : name))
}

