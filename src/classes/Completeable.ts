import { join as lazyCollectionJoin } from 'lazy-collections'
import { createReverse, Pipeable } from "../pipes"
import { isFunction } from '../extracted'

export type CompleteableOptions = {
  segment?: {
    from?: 'start' | 'selection' | 'divider',
    to?: 'end' |'selection' |'divider'
  },
  divider?: RegExp,
  initialSelection?: { start: number, end: number, direction: 'forward' | 'backward' | 'none' },
}

export type CompleteableStatus = 'constructing' | 'ready' | 'completing' | 'completed'

const defaultOptions: CompleteableOptions = {
  segment: {
    from: 'start',
    to: 'end',
  },
  divider: /\s/, // Keep an eye out for use cases where a { before, after } object would be needed, or where multi-character dividers need to be used
}

export type CompleteOptions = {
  select?: 'completion' | 'completionEnd' | (({ before, completion, after }: { before: string, completion: string, after: string }) => Completeable['selection'])
}

const defaultCompleteOptions: CompleteOptions = {
  select: 'completionEnd',
}

export class Completeable {
  private segmentFrom: 'start' | 'selection' | 'divider'
  private segmentTo: 'end' |'selection' |'divider'
  private divider: RegExp
  private computedDividerIndices: { before: number, after: number }

  constructor (string: string, options: CompleteableOptions = {}) {
    this.constructing()
    this.segmentFrom = options?.segment?.from || defaultOptions.segment.from
    this.segmentTo = options?.segment?.to || defaultOptions.segment.to
    this.divider = options?.divider || defaultOptions.divider

    this.computedDividerIndices = { before: 0, after: 0 }

    this.setString(string)
    this.setSelection(options?.initialSelection || { start: string.length, end: string.length, direction: 'none' })
    this.ready()
  }
  private constructing () {
    this.computedStatus = 'constructing'
  }
  private computedStatus: CompleteableStatus
  private ready () {
    this.computedStatus = 'ready'
  }

  get string () {
    return this.computedString
  }
  set string (string) {
    this.setString(string)
  }
  get selection () {
    return this.computedSelection
  }
  set selection (selection) {
    this.setSelection(selection)
  }
  get status () {
    return this.computedStatus
  }
  get segment () {
    return this.string.slice(
      this.getSegmentStartIndex(),
      this.getSegmentEndIndex()
    )
  }
  get dividerIndices () {
    return this.computedDividerIndices
  }
  
  private getSegmentStartIndex (): number {
    switch (this.segmentFrom) {
      case 'start':
        return 0
      case 'selection':
        return this.selection.start // No arithmetic needed, because the first character of the selection should be included
      case 'divider':
        return this.dividerIndices.before + 1 // Segment starts at the character after the divider. If no divider is found, toPreviousMatch returns -1, and this becomes 0
    }
  }
  private getSegmentEndIndex (): number {
    switch (this.segmentTo) {
      case 'end':
        return this.string.length
      case 'selection':
        return this.selection.end // No arithmetic needed, because the browser sets selection end as the first character not highlighted in the selection
      case 'divider':
        return this.dividerIndices.after // No arithmetic needed, because segment ends before the divider index, so the divider index should be the second arg for slice. -1 edge case is effectd by setDividerIndices
    }
  }

  private computedString: string
  setString (string: string) {
    this.computedString = string

    switch (this.status) {
      case 'constructing':
        // do nothing. Can't set divider indices before selection has been set.
        break
      default:
        this.setDividerIndices()
        break
    }
    
    return this
  }

  // TODO: Support array of selections for multi cursor editing
  private computedSelection: { start: number, end: number, direction: 'forward' | 'backward' | 'none' }
  setSelection (selection: { start: number, end: number, direction: 'forward' | 'backward' | 'none' }) {
    this.computedSelection = selection
    this.setDividerIndices()

    return this
  }
  private setDividerIndices () {
    this.computedDividerIndices.before = this.toPreviousMatch({ re: this.divider, from: this.selection.start })

    const after = this.toNextMatch({ re: this.divider, from: this.selection.end })
    this.computedDividerIndices.after = after === -1 ? this.string.length + 1 : after
  }
  private toPreviousMatch ({ re, from }: { re: RegExp, from: number }): number {
    return toPreviousMatch({ string: this.string, re, from })
  }
  private toNextMatch ({ re, from }: { re: RegExp, from: number }): number {
    return toNextMatch({ string: this.string, re, from })
  }

  complete (completion: string, options: { select?: 'completion' | 'completionEnd' } = {}) {
    this.completing()

    const { select } = { ...defaultCompleteOptions, ...options },
          before = this.getBefore(),
          after = this.getAfter(),
          completedString = before + completion + after,
          completedSelection = (() => {
            if (isFunction(select)) {
              return select({ before, completion, after })
            }

            switch (select) {
              case 'completion':
                return {
                  start: before.length,
                  end: `${before}${completion}`.length,
                  direction: this.selection.direction,
                }
              case 'completionEnd':
                return {
                  start: `${before}${completion}`.length,
                  end: `${before}${completion}`.length,
                  direction: this.selection.direction,
                }
            }
          })()

    this.setString(completedString)
    this.setSelection(completedSelection)

    this.completed()

    return this
  }
  private getBefore () {
    switch (this.segmentFrom) {
      case 'start':
        return ''
      case 'selection':
        return this.string.slice(0, this.selection.start)
      case 'divider':
        return this.string.slice(0, this.dividerIndices.before + 1) // Add 1 to make sure the divider is included
    }
  }
  private getAfter () {
    switch (this.segmentTo) {
      case 'end':
        return ''
      case 'selection':
        return this.string.slice(this.selection.end)
      case 'divider':
        return this.string.slice(this.dividerIndices.after)
    }
  }
  private completing () {
    this.computedStatus = 'completing'
  }
  private completed () {
    this.computedStatus = 'completed'
  }
}

const join = lazyCollectionJoin(''),
      reverse = createReverse<string>()
export function toPreviousMatch ({ string, re, from }: { string: string, re: RegExp, from: number }): number {
  let indexOf
  if (!re.test(string.slice(0, from)) || from === 0) {
    indexOf = -1
  } else {
    const reversedStringBeforeFrom = new Pipeable(string).pipe(
            (string: string) => string.slice(0, from),
            (sliced: string) => sliced.split(''),
            reverse,
            join
          ) as string,
          toNextMatchIndex = toNextMatch({ string: reversedStringBeforeFrom, re, from: 0 })
    
    indexOf = toNextMatchIndex === -1
      ? -1
      : (reversedStringBeforeFrom.length - 1) - toNextMatchIndex
  }

  return indexOf
}

export function toNextMatch ({ string, re, from }: { string: string, re: RegExp, from: number }): number {
  const searchResult = string.slice(from).search(re),
        indexOf = searchResult === -1
          ? -1
          : from + searchResult

  return indexOf
}
