/*
 * Completable.js
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

/* Util */
import lastMatch from '../util/lastMatch'
import callback from '../util/callback'

class Completable {
  /* Private properties */
  #segmentsFromDivider
  #segmentsToLocation
  #divider
  // TODO: is there a use case for nextMatch instead of lastMatch?
  // #matchDirection
  #locatesAfterCompletion
  #onComplete
  #onLocate

  constructor (string, options = {}) {
    /* Options */
    options = {
      segmentsFromDivider: false,
      segmentsToLocation: false,
      divider: /\s/,
      locatesAfterCompletion: true,
      onComplete: (completedString, instance) => instance.setString(completedString),
      onLocate: (newLocation, instance) => instance.setLocation(newLocation),
      ...options
    }
    this.#segmentsFromDivider = options.segmentsFromDivider
    this.#segmentsToLocation = options.segmentsToLocation
    this.#divider = options.divider
    // this.#matchDirection = matchDirection
    this.#locatesAfterCompletion = options.locatesAfterCompletion
    this.#onComplete = options.onComplete
    this.#onLocate = options.onLocate

    this.string = string
    this.location = string.length
  }

  get segment () {
    return this.string.slice(
      this.#computeSegmentStartIndex(),
      this.#computeSegmentEndIndex()
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
  complete (completion) {
    const textBefore = this.string.slice(0, this.location - this.segment.length), // segmentsFromDivider
          textAfter = this.string.slice(this.#computeSegmentEndIndex()), // segmentsToLocation
          completedString = textBefore + completion + textAfter,
          newLocation = this.#locatesAfterCompletion ? textBefore.length + completion.length : this.location

    callback(this.#onComplete, completedString, this)
    callback(this.#onLocate, newLocation, this)

    return this
  }

  /* Private methods */
  #computeSegmentStartIndex = function() {
    return this.#segmentsFromDivider ? lastMatch(this.string, this.#divider, this.location) + 1 : 0
  }
  #computeSegmentEndIndex = function() {
    return this.#segmentsToLocation ? this.location : this.string.length
  }
}

export default Completable
