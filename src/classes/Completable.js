/*
 * Completable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

/* Util */
import lastMatch from '../util/lastMatch'
import emit from '../util/emit'

class Completable {
  /* Private properties */
  // _segmentsFromDivider
  // _segmentsToLocation
  // _divider
  // TODO: is there a use case for nextMatch instead of lastMatch?
  // _matchDirection
  // _locatesAfterCompletion
  // _onComplete
  // _onLocate

  constructor (string, options = {}) {
    /* Options */
    options = {
      segmentsFromDivider: false,
      segmentsToLocation: false,
      divider: /\s/,
      onComplete: (completedString, instance) => instance.setString(completedString),
      onLocate: (newLocation, instance) => instance.setLocation(newLocation),
      ...options
    }
    this._segmentsFromDivider = options.segmentsFromDivider
    this._segmentsToLocation = options.segmentsToLocation
    this._divider = options.divider
    this._onComplete = options.onComplete
    this._onLocate = options.onLocate
    // this._matchDirection = matchDirection

    this.string = string
    this.location = string.length
  }

  get segment () {
    return this.string.slice(
      this._computeSegmentStartIndex(),
      this._computeSegmentEndIndex()
    )
  }

  setString (string) {
    this.string = string
    return this
  }
  setLocation (location) {
    this.location = location
    return this
  }
  complete (completion, options = {}) {
    options = {
      locatesAfterCompletion: true,
      ...options
    }

    const { locatesAfterCompletion } = options,
          textBefore = this.string.slice(0, this.location - this.segment.length), // segmentsFromDivider
          textAfter = this.string.slice(this._computeSegmentEndIndex()), // segmentsToLocation
          completedString = textBefore + completion + textAfter,
          newLocation = locatesAfterCompletion ? textBefore.length + completion.length : this.location

    emit(this._onComplete, completedString, this)
    emit(this._onLocate, newLocation, this)

    return this
  }

  /* Private methods */
  _computeSegmentStartIndex = function() {
    return this._segmentsFromDivider ? lastMatch(this.string, this._divider, this.location) + 1 : 0
  }
  _computeSegmentEndIndex = function() {
    return this._segmentsToLocation ? this.location : this.string.length
  }
}

export default Completable
