import slugify from '@sindresorhus/slugify'
import type { Options as SlugifyOptions } from '@sindresorhus/slugify'

export type StringFn<Returned> = (string: string) => Returned

export function createClip(required: string | RegExp): StringFn<string> {
  return string => {
    return string.replace(required, '')
  }
}

export function createSlug(options?: SlugifyOptions): StringFn<string> {
  return string => {
    return slugify(string, options)
  }
}
