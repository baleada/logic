import { find } from 'lazy-collections'

export function fromEventToKeyStatusCode ({ code }: KeyboardEvent) {
  const modifier = find<string>(
    modifier => code.includes(modifier)
  )(modifiers) as string

  return modifier || code
}

export const modifiers = ['Alt', 'Control', 'Meta', 'Shift'] as const
