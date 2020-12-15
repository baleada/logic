import { uniqueable } from '../factories'

export default function toCombo (type, delimiter = '+') {
  // If the delimiter is used as a character in the type,
  // two empty strings will be produced by the split.
  // Uniqueable ensures those two are combined into one.
  return uniqueable(type.split(delimiter))
    .unique()
    .map(name => (name === '' ? delimiter : name))
}

