import type { Config as DOMPurifyConfig } from 'dompurify'
import createDOMPurify from 'dompurify'
import slugify from '@sindresorhus/slugify'
import type { Options as SlugifyOptions } from '@sindresorhus/slugify'

export type StringTransform<Transformed> = (string: string) => Transformed

/**
 * [Docs](https://baleada.dev/docs/logic/pipes/clip)
 */
export function createClip(content: string | RegExp): StringTransform<string> {
  return string => {
    return string.replace(content, '')
  }
}

/**
 * [Docs](https://baleada.dev/docs/logic/pipes/slug)
 */
export function createSlug(options?: SlugifyOptions): StringTransform<string> {
  return string => {
    return slugify(string, options)
  }
}

/**
 * [Docs](https://baleada.dev/docs/logic/pipes/sanitize)
 */
export function createSanitize (options?: DOMPurifyConfig): StringTransform<string> {
  const dompurify = createDOMPurify()
  dompurify.setConfig(options)

  return string => {
    return dompurify.sanitize(string)
  }
}

/**
 * [Docs](https://baleada.dev/docs/logic/pipes/split)
 */
export function createSplit (options: { separator?: string | RegExp, limit?: number }): StringTransform<string[]> {
  const { separator = '', limit } = options
  
  return string => {
    return string.split(separator, limit)
  }
}
