/*
 * Completeable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

/* Util */
import lastMatch from '../util/lastMatch'
import is from '../util/is'

const defaultOptions = {
  segmentsFromDivider: false,
  segmentsToLocation: false,
  divider: /\s/,
  // initialLocation
}

export default class Completeable {
  constructor (string, options = {}) {    
    this._segmentsFromDivider = is.defined(options.segmentsFromDivider) ? options.segmentsFromDivider : defaultOptions.segmentsFromDivider
    this._segmentsToLocation = is.defined(options.segmentsToLocation) ? options.segmentsToLocation : defaultOptions.segmentsToLocation
    this._divider = is.defined(options.divider) ? options.divider : defaultOptions.divider
    // this._matchDirection = matchDirection TODO: is there a use case for nextMatch instead of lastMatch?

    this.setString(string)
    this.setLocation(options.hasOwnProperty('initialLocation') ? options.initialLocation : string.length)
    this._ready()
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
  get location () {
    return this._computedLocation
  }
  set location (location) {
    this.setLocation(location)
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

    this._completed()

    return this
  }
  _completed () {
    this._computedStatus = 'completed'
  }
}
