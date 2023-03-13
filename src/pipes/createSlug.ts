import slugify from '@sindresorhus/slugify'
import { Options as SlugifyOptions } from '@sindresorhus/slugify'
import type { StringFunction } from './types'

export function createSlug(options?: SlugifyOptions): StringFunction<string> {
  return string => {
    return slugify(string, options);
  };
}
