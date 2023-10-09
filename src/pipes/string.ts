import { Searcher, sortKind } from 'fast-fuzzy'
import type { FullOptions as SearcherOptions, MatchData as SearcherMatchData } from 'fast-fuzzy'
import type { Config as DOMPurifyConfig } from 'dompurify'
import createDOMPurify from 'dompurify'
import slugify from '@sindresorhus/slugify'
import type { Options as SlugifyOptions } from '@sindresorhus/slugify'
import { predicateFunction } from '../extracted'

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

/**
 * [Docs](https://baleada.dev/docs/logic/pipes/number)
 */
export function createNumber (options: { radix?: number } = {}): StringTransform<number> {
  const { radix = 10 } = options
  return string => parseInt(string, radix)
}

export type CreateResultsOptions<Candidate extends string | object, MatchData extends boolean> = Omit<SearcherOptions<Candidate>, 'returnMatchData'> & {
  returnMatchData?: MatchData,
}

export function createResults<Candidate extends string | object, MatchData extends boolean = false> (
  candidates: Candidate[],
  options: (
    CreateResultsOptions<Candidate, MatchData>
    | ((api: { sortKind: typeof sortKind }) => CreateResultsOptions<Candidate, MatchData>)
  ) = {}
): StringTransform<MatchData extends true ? SearcherMatchData<Candidate>[] : Candidate[]> {
  const narrowedOptions = predicateFunction(options)
          ? options({ sortKind })
          : options,
        searcher = new Searcher(candidates, narrowedOptions)

  return (query: string) => searcher.search(query)
}
