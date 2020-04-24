/*
 * Completeable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

/* Util */
import lastMatch from '../util/lastMatch'
import nextMatch from '../util/nextMatch'
import is from '../util/is'

const defaultOptions = {
  segment: {
    from: 'start', // start|selection|divider
    to: 'end', // end|selection|divider
  },
  divider: /\s/, // Keep an eye out for use cases where a { before, after } object would be needed, or where multi-character dividers need to be used
  // initialSelection
}

function getSegmentFrom (options) {
  if (options.hasOwnProperty('segment')) {
    return is.defined(options.segment.from) ? options.segment.from : defaultOptions.segment.from
  } else {
    return defaultOptions.segment.from
  }
}

function getSegmentTo (options) {
  if (options.hasOwnProperty('segment')) {
    return is.defined(options.segment.to) ? options.segment.to : defaultOptions.segment.to
  } else {
    return defaultOptions.segment.to
  }
}

export default class Completeable {
  constructor (string, options = {}) {
    this._constructing()
    this._segmentFrom = getSegmentFrom(options)
    this._segmentTo = getSegmentTo(options)
    this._divider = is.defined(options.divider) ? options.divider : defaultOptions.divider

    this._computedDividerIndices = { before: 0, after: 0 }

    this.setString(string)
    this.setSelection(options.hasOwnProperty('initialSelection') ? options.initialSelection : { start: string.length, end: string.length })
    this._ready()
  }
  _constructing () {
    this._computedStatus = 'constructing'
  }
  _ready () {
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
      this._computeSegmentStartIndex(),
      this._computeSegmentEndIndex()
    )
  }
  get dividerIndices () {
    return this._computedDividerIndices
  }
  _computeSegmentStartIndex () {
    let index
    switch (this._segmentFrom) {
    case 'start':
      index = 0
      break
    case 'selection':
      index = this.selection.start // No arithmetic needed, because the first character of the selection should be included
      break
    case 'divider':
      index = this.dividerIndices.before + 1 // Segment starts at the character after the divider. If no divider is found, lastMatch returns -1, and this becomes 0
    }
    
    return index
  }
  _computeSegmentEndIndex () {
    let index
    switch (this._segmentTo) {
    case 'end':
      index = this.string.length
      break
    case 'selection':
      index = this.selection.end + 1 // Make sure the segment includes the end of the selection. Test in browser to make sure that's what happens
      break
    case 'divider':
      index = this.dividerIndices.after // No arithmetic needed, because segment ends before the divider index, so the divider index should be the second arg for slice. -1 edge case is handled by setDividerIndices
    }
    
    return index
  }

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

  setSelection (selection) {
    // VALIDATE: selection can only have start, end, and direction properties

    this._computedSelection = selection
    this._setDividerIndices()

    return this
  }
  _setDividerIndices () {
    this._computedDividerIndices.before = this._lastMatch({ expression: this._divider, from: this.selection.start })

    const after = this._nextMatch({ expression: this._divider, from: this.selection.end })
    this._computedDividerIndices.after = after === -1 ? this.string.length + 1 : after
  }
  _lastMatch ({ expression, from }) {
    return lastMatch({ string: this.string, expression, from })
  }
  _nextMatch ({ expression, from }) {
    return nextMatch({ string: this.string, expression, from })
  }

  complete (completion, options = {}) {
    this._completing()

    options = {
      newSelection: 'completionEnd', // completion|completionEnd
      ...options
    }

    const { newSelection: ns } = options,
          textBefore = this._getTextBefore(),
          textAfter = this._getTextAfter(),
          completedString = textBefore + completion + textAfter
    
    let newSelection
    switch (ns) {
    case 'completion':
      newSelection = {
        start: textBefore.length,
        end: `${textBefore}${completion}`.length // Unsure about the arithmetic. test in browser to find desired result.
      }
      break
    case 'completionEnd':
      newSelection = {
        start: `${textBefore}${completion}`.length,
        end: `${textBefore}${completion}`.length,
      }
      break
    }

    this.setString(completedString)
    this.setSelection(newSelection)

    this._completed()

    return this
  }
  _getTextBefore () {
    let text
    switch (this._segmentFrom) {
    case 'start':
      text = ''
      break
    case 'selection':
      text = this.string.slice(0, this.selection.start)
      break
    case 'divider':
      text = this.string.slice(0, this.dividerIndices.before + 1) // Add 1 to make sure the divider is included
      break
    }

    return text
  }
  _getTextAfter () {
    let text
    switch (this._segmentTo) {
    case 'end':
      text = ''
      break
    case 'selection':
      text = this.string.slice(this.selection.end + 1)
      break
    case 'divider':
      text = this.string.slice(this.dividerIndices.after)
      break
    }

    return text
  }
  _completing () {
    this._computedStatus = 'completing'
  }
  _completed () {
    this._computedStatus = 'completed'
  }
}
