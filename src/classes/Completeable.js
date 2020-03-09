/*
 * Completeable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

/* Util */
import { lastMatch, emit } from '../util'

export default class Completeable {
  constructor (string, options = {}) {
    /* Options */
    options = {
      segmentsFromDivider: false,
      segmentsToLocation: false,
      divider: /\s/,
      // initialLocation
      ...options
    }
    
    this._segmentsFromDivider = options.segmentsFromDivider
    this._segmentsToLocation = options.segmentsToLocation
    this._divider = options.divider
    // this._matchDirection = matchDirection TODO: is there a use case for nextMatch instead of lastMatch?

    this.setString(string)
    this.setLocation(options.hasOwnProperty('initialLocation') ? options.initialLocation : string.length)
  }

  get string () {
    return this._computedString
  }
  get location () {
    return this._computedLocation
  }
  get segment () {
    return this.string.slice(
      this._computeSegmentStartIndex(),
      this._computeSegmentEndIndex()
    )
  }
  _computeSegmentStartIndex () {
    return this._segmentsFromDivider ? lastMatch(this.string, this._divider, this.location) + 1 : 0
  }
  _computeSegmentEndIndex () {
    return this._segmentsToLocation ? this.location : this.string.length
  }

  setString (string) {
    this._computedString = string
    return this
  }
  setLocation (location) {
    this._computedLocation = location
    return this
  }
  complete (completion, options = {}) {
    options = {
      locatesAfterCompletion: true,
      ...options
    }

    const { locatesAfterCompletion } = options,
          textBefore = this.string.slice(0, this.location - this.segment.length), // segmentsFromDivider option affects this
          textAfter = this.string.slice(this._computeSegmentEndIndex()), // segmentsToLocation option affects this
          completedString = textBefore + completion + textAfter,
          newLocation = locatesAfterCompletion ? textBefore.length + completion.length : this.location

    this.setString(completedString)
    this.setLocation(newLocation)

    return this
  }
}
