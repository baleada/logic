import { includes } from 'lazy-collections'

export function fromEventToKeyStatusKey ({ key, code }: KeyboardEvent) {
  return includes<string>(key)(modifiers) as boolean
    ? { key: key }
    : { code: code }
}

export const modifiers = ['Alt', 'Control', 'Meta', 'Shift']
