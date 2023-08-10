import slugify from '@sindresorhus/slugify'
import type { Options as SlugifyOptions } from '@sindresorhus/slugify'

export type StringTransform<Transformed> = (string: string) => Transformed

export function createClip(required: string | RegExp): StringTransform<string> {
  return string => {
    return string.replace(required, '')
  }
}

export function createSlug(options?: SlugifyOptions): StringTransform<string> {
  return string => {
    return slugify(string, options)
  }
}
