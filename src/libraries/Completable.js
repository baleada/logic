/*
 * Completable.js
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

// Utils
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
class Completable extends String {
  /* Private properties */
  #segmentsFromDivider
  #segmentsToPosition
  #divider
  // TODO: is there a use case for nextMatch instead of lastMatch?
  // #matchDirection
  #positionsAfterCompletion
  #onComplete
  #onPosition

  /**
   * Completable constructor
   * @param {String}  string                          The string that will be made completable
   * @param {Boolean} [segmentsFromDivider=false]     `true` when the Completable instance should start from a divider (for example, the space between words) while extracting a segment, and `false when it should start from the very beginning of the string. See the <nuxt-link to="#How-the-Completable-instance-extracts-segments">How the Completable instance extracts segments</nuxt-link> section for more info.
   * @param {Boolean} [segmentsToPosition=false]      `true` when the Completable instance should stop at the current position while extracting a segment, and `false` when it should stop at the very end of the string. See the <nuxt-link to="#How-the-Completable-instance-extracts-segments">How the Completable instance extracts segments</nuxt-link> section for more info.
   * @param {RegExp}  [divider=/s/]                   <p>Tells the Completable instance how segments of the string are divided. Has no effect when <code>segmentsFromDivider</code> is <code>false</code>.</p><p>See the <nuxt-link to="#How-the-Completable-instance-extracts-segments">How the Completable instance extracts segments</nuxt-link> section for more info.</p>
   * @param {Boolean} [positionsAfterCompletion=true] <p><code>true</code> when the Completable instance, after completing the string, should set the current position to the index after the segment's replacement. `false` when it should not change the current position.</p><p>See the <nuxt-link to="#How-the-Completable-instance-handles-current-position">How the Completable instance handles current position</nuxt-link> section for more info.</p>
   * @param {Function}  [onComplete]                    A function that Completable will call after completing the string. `onComplete` has one paramater: the completed string (String).
   * @param {Function}  [onPosition]                    A function that Completable will call after completing the string. `onPosition` accepts two parameters: the new position (Number), and the Completable instance (Object).
   */
  constructor(string, options = {}) {
    super(string)

    /* Options */
    options = {
      segmentsFromDivider: false,
      segmentsToPosition: false,
      divider: /\s/,
      positionsAfterCompletion: true,
      ...options
    }
    this.#segmentsFromDivider = options.segmentsFromDivider
    this.#segmentsToPosition = options.segmentsToPosition
    this.#divider = options.divider
    // this.#matchDirection = matchDirection
    this.#positionsAfterCompletion = options.positionsAfterCompletion
    this.#onComplete = options.onComplete
    this.#onPosition = options.onPosition

    /* Public properties */
    /**
     * The current index-based position in the `string`. See the <nuxt-link to="#How-the-Completable-instance-handles-current-position">How the Completable instance handles current position</nuxt-link> section for more info.
     * @type {Number}
     */
    this.position = string.length
  }

  /* Public getters */
  /**
   * Segment getter function
   * @return {String} An extracted segment of `string`. See the <nuxt-link to="#How-the-Completable-instance-extracts-segments">How the Completable instance extracts segments</nuxt-link> section for more info.
   */
  get segment() {
    return this.slice(
      this.#computeSegmentStartIndex(),
      this.#computeSegmentEndIndex()
    )
  }

  /* Public methods */
  /**
   * Constructs a new Completable instance using a new string and the options passed to the original instance
   * @param {String} string The new string
   * @return {Object}       The new Completable instance
   */
  set(string) {
    const instance = new Completable(string, {
      segmentsFromDivider: this.#segmentsFromDivider,
      segmentsToPosition: this.#segmentsToPosition,
      divider: this.#divider,
      // matchDirection: this.#matchDirection,
      positionsAfterCompletion: this.#positionsAfterCompletion,
      onComplete: this.#onComplete,
      onPosition: this.#onPosition,
    })

    return instance
  }
  /**
   * <p>Sets the position from which the Completable instance will start extracting segments.</p><p>See the <nuxt-link to="#How-the-Completable-instance-extracts-segments">How the Completable instance extracts segments</nuxt-link> section and the <nuxt-link to="#How-the-Completable-instance-handles-current-position">How the Completable instance handles current position</nuxt-link> section for more info.</p>
   * @param {Number} position The new `position`
   * @return {Object}       The Completable instance
   */
  setPosition(position) {
    this.position = position
    return this
  }
  /**
   * <p>Completes the string, replacing <code>segment</code> with a completion/replacement string, and computes a new position based on the <code>positionsAfterCompletion</code> option. Afterward, <code>complete</code> calls the user-provided <code>onComplete</code> function, passing the new string and the new position.</p><p>Note that <code>complete</code> does not set its <code>string</code> or <code>position</code> to the new values, but the user can do so using <code>set</code> and <code>setPosition</code>.</p>
   * @param {String} completion The completion/replacement.
   * @return {Object}       The Completable instance
   */
  complete(completion) {
    const textBefore = this.#segmentsFromDivider ? this.slice(0, this.position - this.segment.length) : '',
          textAfter = this.#segmentsToPosition ? this.slice(this.position) : '',
          string = textBefore + completion + textAfter,
          position = this.#positionsAfterCompletion ? textBefore.length + completion.length : this.position

    if (is.function(this.#onComplete)) this.#onComplete(string, this)
    if (is.function(this.#onPosition)) this.#onPosition(position, this)

    return this
  }

  /* Private methods */
  #computeSegmentStartIndex = function() {
    return this.#segmentsFromDivider ? lastMatch(this, this.#divider, this.position) + 1 : 0
  }
  #computeSegmentEndIndex = function() {
    return this.#segmentsToPosition ? this.position : this.length
  }
}

export default Completable
