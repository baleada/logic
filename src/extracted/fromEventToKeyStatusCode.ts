import { find } from 'lazy-collections'
import type { KeyboardEventDescriptor } from './keyboard-event-descriptor'

export function fromEventToKeyStatusCode ({ code }: KeyboardEventDescriptor) {
  const modifier = find<string>(
    modifier => code.includes(modifier)
  )(modifiers) as string

  return modifier || code
}

export const modifiers = ['Alt', 'Control', 'Meta', 'Shift'] as const
