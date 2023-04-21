import type { StringFn } from './types'

export function createClip(required: string | RegExp): StringFn<string> {
  return string => {
    return string.replace(required, '')
  }
}
