import type { StringFunction } from './types'

export function createClip(required: string | RegExp): StringFunction<string> {
  return string => {
    return string.replace(required, '');
  };
}
