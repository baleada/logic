/*
 * completable.js v1.0.0
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

// Utils
import is from './is.js'
import lastMatch from './last-match.js'

class Completable {
  #segmentsFromDivider
  #segmentsToPosition
  #divider
  // TODO: is there a use case for nextMatch instead of lastMatch?
  // #matchDirection
  #positionsAfterCompletion
  #onComplete
  #onPosition

  constructor(string, options) {
    this.string = string

    options = {
      // Default settings are designed to support an autocomplete component that replaces the full segment/search term with a completion
      segmentsFromDivider: false,
      segmentsToPosition: false,
      divider: /\s/,
      positionsAfterCompletion: true,
      ...options
    }

    this.#segmentsFromDivider = options.segmentsFromDivider
    this.#segmentsToPosition = options.segmentsToPosition
    this.#divider = options.divider
    // this.#matchDirection = options.matchDirection
    this.#positionsAfterCompletion = options.positionsAfterCompletion
    this.#onComplete = options.onComplete
    this.#onPosition = options.onPosition

    this.position = this.string.length
  }

  // Getters and setters
  get segment () {
    return this.string.slice(
      this.#segmentsFromDivider ? lastMatch(this.string, this.#divider, this.position) + 1 : 0, // start index
      this.#segmentsToPosition ? this.position : this.string.length // end index
    )
  }
  set newString (newString) {
    if (is.function(this.#onComplete)) this.#onComplete(newString)
  }
  set newPosition (newPosition) {
    if (is.function(this.#onPosition)) this.#onPosition(newPosition)
  }

  // Utils
  setString (string) {
    this.string = string
  }
  setPosition (position) {
    this.position = position
  }

  // Core
  complete (completion) {
    const textBefore = this.#segmentsFromDivider ? this.string.slice(0, this.position - this.segment.length) : '',
          textAfter = this.#segmentsToPosition ? this.string.slice(this.position) : '',
          string = textBefore + completion + textAfter,
          position = this.#positionsAfterCompletion ? textBefore.length + completion.length : this.position

    this.newString = string
    this.newPosition = position
  }
}

export default Completable
