/*
 * Completeable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

/* Util */
import toLastMatch from '../util/toLastMatch'
import toNextMatch from '../util/toNextMatch'

const defaultOptions = {
  segment: {
    from: 'start', // start|selection|divider
    to: 'end', // end|selection|divider
  },
  divider: /\s/, // Keep an eye out for use cases where a { before, after } object would be needed, or where multi-character dividers need to be used
  // initialSelection
}

export default class Completeable {
  constructor (string, options = {}) {
    this._constructing()
    this._segmentFrom = options?.segment?.from || defaultOptions.segment.from
    this._segmentTo = options?.segment?.to || defaultOptions.segment.to
    this._divider = options?.divider || defaultOptions.divider

    this._computedDividerIndices = { before: 0, after: 0 }

    this.setString(string)
    this.setSelection(options?.initialSelection || { start: string.length, end: string.length })
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
    switch (this._segmentFrom) {
      case 'start':
        return 0
      case 'selection':
        return this.selection.start // No arithmetic needed, because the first character of the selection should be included
      case 'divider':
        return this.dividerIndices.before + 1 // Segment starts at the character after the divider. If no divider is found, toLastMatch returns -1, and this becomes 0
    }
    
    return index
  }
  _computeSegmentEndIndex () {
    switch (this._segmentTo) {
      case 'end':
        return this.string.length
      case 'selection':
        return this.selection.end // No arithmetic needed, because the browser sets selection end as the first character not highlighted in the selection
      case 'divider':
        return this.dividerIndices.after // No arithmetic needed, because segment ends before the divider index, so the divider index should be the second arg for slice. -1 edge case is handled by setDividerIndices
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
    this._computedDividerIndices.before = this._toLastMatch({ expression: this._divider, from: this.selection.start })

    const after = this._toNextMatch({ expression: this._divider, from: this.selection.end })
    this._computedDividerIndices.after = after === -1 ? this.string.length + 1 : after
  }
  _toLastMatch ({ expression, from }) {
    return toLastMatch({ string: this.string, expression, from })
  }
  _toNextMatch ({ expression, from }) {
    return toNextMatch({ string: this.string, expression, from })
  }

  complete (completion, options = {}) {
    this._completing()

    options = {
      newSelection: 'completionEnd', // completion|completionEnd
      ...options
    }

    const { newSelection: newSelectionOption } = options,
          textBefore = this._getTextBefore(),
          textAfter = this._getTextAfter(),
          completedString = textBefore + completion + textAfter,
          newSelection = (() => {
            switch (newSelectionOption) {
              case 'completion':
                return {
                  start: textBefore.length,
                  end: `${textBefore}${completion}`.length
                }
              case 'completionEnd':
                return {
                  start: `${textBefore}${completion}`.length,
                  end: `${textBefore}${completion}`.length,
                }
            }
          })()

    this.setString(completedString)
    this.setSelection(newSelection)

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

    return text
  }
  _completing () {
    this._computedStatus = 'completing'
  }
  _completed () {
    this._computedStatus = 'completed'
  }
}
