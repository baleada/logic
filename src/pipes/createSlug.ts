import slugify from '@sindresorhus/slugify'
import type { Options as SlugifyOptions } from '@sindresorhus/slugify'
import type { StringFn } from './types'

export function createSlug(options?: SlugifyOptions): StringFn<string> {
  return string => {
    return slugify(string, options)
  }
}
