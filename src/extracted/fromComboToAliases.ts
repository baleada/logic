import {
  pipe,
  unique,
  map,
  toArray,
} from 'lazy-collections'

export function fromComboToAliases (combo: string): string[] {
  const delimiter = '+'
  // If the delimiter is used as a character in the type,
  // two empty strings will be produced by the split.
  // unique() combines those two into one.
  return pipe(
    unique<string>(),
    map<string, string>(name => name === '' ? delimiter : name.toLowerCase()),
    toArray(),
  )(combo.split(delimiter)) as string[]
}

