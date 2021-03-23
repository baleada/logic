/**
 * @type {CompleteableOptions}
 */
const defaultOptions = {
  segment: {
    from: 'start', // start|selection|divider
    to: 'end', // end|selection|divider
  },
  divider: /\s/, // Keep an eye out for use cases where a { before, after } object would be needed, or where multi-character dividers need to be used
}

export class Completeable {
  /**
   * @typedef {{ segment?: { from?: 'start' | 'selection' | 'divider', to?: 'end' |'selection' |'divider' }, divider?: RegExp, initialSelection?: CompleteableSelection }} CompleteableOptions
   * @param {string} string
   * @param {CompleteableOptions} [options]
   */
  constructor (string, options = {}) {
    this._constructing()
    this._segmentFrom = options?.segment?.from || defaultOptions.segment.from
    this._segmentTo = options?.segment?.to || defaultOptions.segment.to
    this._divider = options?.divider || defaultOptions.divider

    this._computedDividerIndices = { before: 0, after: 0 }

    this.setString(string)
    this.setSelection(options?.initialSelection || { start: string.length, end: string.length, direction: 'none' })
    this._ready()
  }
  _constructing () {
    this._computedStatus = 'constructing'
  }
  _ready () {
    /**
     * @type {'constructing' | 'ready' | 'completing' | 'completed'}
     */
    this._computedStatus = 'ready'
  }

  get string () {
    return this._computedString
  }
  set string (string) {
    this.setString(string)
  }
  get selection () {
    return this._computedSelection
  }
  set selection (selection) {
    this.setSelection(selection)
  }
  get status () {
    return this._computedStatus
  }
  get segment () {
    return this.string.slice(
      this._getSegmentStartIndex(),
      this._getSegmentEndIndex()
    )
  }
  get dividerIndices () {
    return this._computedDividerIndices
  }
  
  /**
   * @return {number}
   */
  _getSegmentStartIndex () {
    switch (this._segmentFrom) {
      case 'start':
        return 0
      case 'selection':
        return this.selection.start // No arithmetic needed, because the first character of the selection should be included
      case 'divider':
        return this.dividerIndices.before + 1 // Segment starts at the character after the divider. If no divider is found, toLastMatch returns -1, and this becomes 0
    }
  }
  /**
   * @return {number}
   */
  _getSegmentEndIndex () {
    switch (this._segmentTo) {
      case 'end':
        return this.string.length
      case 'selection':
        return this.selection.end // No arithmetic needed, because the browser sets selection end as the first character not highlighted in the selection
      case 'divider':
        return this.dividerIndices.after // No arithmetic needed, because segment ends before the divider index, so the divider index should be the second arg for slice. -1 edge case is handled by setDividerIndices
    }
  }

  /**
   * @param {string} string 
   */
  setString (string) {
    this._computedString = string

    switch (this.status) {
    case 'constructing':
      // do nothing. Can't set divider indices before selection has been set.
      break
    default:
      this._setDividerIndices()
      break
    }
    
    return this
  }

  /**
   * @typedef {{ start: number, end: number, direction: 'forward' | 'backward' | 'none' }} CompleteableSelection
   * @param {CompleteableSelection} selection 
   */
  setSelection (selection) {
    this._computedSelection = selection
    this._setDividerIndices()

    return this
  }
  _setDividerIndices () {
    this._computedDividerIndices.before = this._toLastMatch({ re: this._divider, from: this.selection.start })

    const after = this._toNextMatch({ re: this._divider, from: this.selection.end })
    this._computedDividerIndices.after = after === -1 ? this.string.length + 1 : after
  }
  /**
   * @param {{ re: RegExp, from: number }} required
   * @return number
   */
  _toLastMatch ({ re, from }) {
    return toLastMatch({ string: this.string, re, from })
  }
  /**
   * @param {{ re: RegExp, from: number }} required
   * @return number
   */
  _toNextMatch ({ re, from }) {
    return toNextMatch({ string: this.string, re, from })
  }

  /**
   * @param {string} completion 
   * @param {{ select?: 'completion' | 'completionEnd' }} [options] 
   */
  complete (completion, options = {}) {
    this._completing()

    options = {
      select: 'completionEnd', // completion|completionEnd
      ...options
    }

    const { select } = options,
          textBefore = this._getTextBefore(),
          textAfter = this._getTextAfter(),
          completedString = textBefore + completion + textAfter,
          completedSelection = (() => {
            switch (select) {
              case 'completion':
                return {
                  start: textBefore.length,
                  end: `${textBefore}${completion}`.length,
                  direction: this.selection.direction,
                }
              case 'completionEnd':
                return {
                  start: `${textBefore}${completion}`.length,
                  end: `${textBefore}${completion}`.length,
                  direction: this.selection.direction,
                }
            }
          })()

    this.setString(completedString)
    this.setSelection(completedSelection)

    this._completed()

    return this
  }
  _getTextBefore () {
    switch (this._segmentFrom) {
      case 'start':
        return ''
      case 'selection':
        return this.string.slice(0, this.selection.start)
      case 'divider':
        return this.string.slice(0, this.dividerIndices.before + 1) // Add 1 to make sure the divider is included
    }
  }
  _getTextAfter () {
    switch (this._segmentTo) {
      case 'end':
        return ''
      case 'selection':
        return this.string.slice(this.selection.end)
      case 'divider':
        return this.string.slice(this.dividerIndices.after)
    }
  }
  _completing () {
    this._computedStatus = 'completing'
  }
  _completed () {
    this._computedStatus = 'completed'
  }
}

/**
 * 
 * @param {{ string: string, re: RegExp, from: number }} required
 & @return {number}
 */
 export function toLastMatch ({ string, re, from }) {
  let indexOf
  if (!re.test(string.slice(0, from)) || from === 0) {
    indexOf = -1
  } else {
    const reversedStringBeforeFrom = string
            .slice(0, from)
            .split('')
            .reverse()
            .join(''),
          toNextMatchIndex = toNextMatch({ string: reversedStringBeforeFrom, re, from: 0 })
    
    indexOf = toNextMatchIndex === -1
      ? -1
      : (reversedStringBeforeFrom.length - 1) - toNextMatchIndex
  }

  return indexOf
}

/**
 * 
 * @param {{ string: string, re: RegExp, from: number }} required
 & @return {number}
 */
export function toNextMatch ({ string, re, from }) {
  const searchResult = string.slice(from).search(re),
        indexOf = searchResult === -1
          ? -1
          : from + searchResult

  return indexOf
}
