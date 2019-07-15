/*
 * Completable.js v1.0.0
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

// Utils
import assignPublicMethods from '../utils/assignPublicMethods'
import is from '../utils/is'
import lastMatch from '../utils/lastMatch'

/**
 * Completable is a library that enriches a string by:
 * - Allowing it to store
 * - Allowing it to extract a segment of the string
 * - Giving it the methods necessary to replace the segment or the full string with a more complete string
 *
 * Completable is written in vanilla JS with no dependencies. It powers <nuxt-link to="/docs/tools/composition-functions/useCompletable">`useCompletable`</nuxt-link>.
 */
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

    // Public properties
    /**
     * A shallow copy of the string passed to the Completable constructor
     * @type {String}
     */
    this.string = string
    /**
     * The current index-based position in the `string`. See the <nuxt-link to="#How-the-Completable-instance-handles-current-position">How the Completable instance handles current position</nuxt-link> section for more info.
     * @type {Number}
     */
    this.position = this.string.length

    // Public methods
    /**
     * Sets a value for `string`. Takes one argument: the new `string`
     * @param {[type]} string [description]
     */
    function setString (string) {
      this.string = string
    }
    /**
     * <p>Sets the position from which the Completable instance will start extracting segments.</p><p>See the <nuxt-link to="#How-the-Completable-instance-extracts-segments">How the Completable instance extracts segments</nuxt-link> section and the <nuxt-link to="#How-the-Completable-instance-handles-current-position">How the Completable instance handles current position</nuxt-link> section for more info.</p>
     * @param {Number} position the new position
     */
    function setPosition (position) {
      this.position = position
    }
    /**
     * <p>Completes the string, replacing <code>segment</code> with a completion/replacement string, and computes a new position based on the <code>positionsAfterCompletion</code> option. Afterward, <code>complete</code> calls the user-provided <code>onComplete</code> function, passing the new string and the new position.</p><p>Note that <code>complete</code> does not set its <code>string</code> or <code>position</code> to the new values, but the user can do so using <code>setString</code> and <code>setPosition</code>.</p>
     * @param {String} completion the completion/replacement.
     */
    function complete (completion) {
      const textBefore = this.#segmentsFromDivider ? this.string.slice(0, this.position - this.segment.length) : '',
            textAfter = this.#segmentsToPosition ? this.string.slice(this.position) : '',
            string = textBefore + completion + textAfter,
            position = this.#positionsAfterCompletion ? textBefore.length + completion.length : this.position

      this.string = string
      this.position = position
      if (is.function(this.#onComplete)) this.#onComplete(string)
      if (is.function(this.#onPosition)) this.#onPosition(position)
    }

    assignPublicMethods(this, {
      setString,
      setPosition,
      complete
    })
  }

  // Getters and setters
  /**
   * Segment getter function
   * @return {String} An extracted segment of `string`. See the <nuxt-link to="#How-the-Completable-instance-extracts-segments">How the Completable instance extracts segments</nuxt-link> section for more info.
   */
  get segment () {
    return this.string.slice(
      this.#computeSegmentStartIndex(),
      this.#computeSegmentEndIndex()
    )
  }

  // Private methods
  #computeSegmentStartIndex = function() {
    return this.#segmentsFromDivider ? lastMatch(this.string, this.#divider, this.position) + 1 : 0
  }
  #computeSegmentEndIndex = function() {
    return this.#segmentsToPosition ? this.position : this.string.length
  }
}

export default Completable
