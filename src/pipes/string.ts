import slugify from '@sindresorhus/slugify'
import type { Options as SlugifyOptions } from '@sindresorhus/slugify'
import type { StringFn } from './types'

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
