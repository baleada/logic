/*
 * Completable.js
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

// Utils
import assignEnumerables from '../utils/assignEnumerables'
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
  constructor(string, {
    segmentsFromDivider = false,
    segmentsToPosition = false,
    divider = /\s/,
    positionsAfterCompletion = true,
    onComplete,
    onPosition
  }) {
    /* Options */
    this.#segmentsFromDivider = segmentsFromDivider
    this.#segmentsToPosition = segmentsToPosition
    this.#divider = divider
    // this.#matchDirection = matchDirection
    this.#positionsAfterCompletion = positionsAfterCompletion
    this.#onComplete = onComplete
    this.#onPosition = onPosition

    /* Public properties */
    /**
     * A shallow copy of the string passed to the Completable constructor
     * @type {String}
     */
    string = string
    /**
     * The current index-based position in the `string`. See the <nuxt-link to="#How-the-Completable-instance-handles-current-position">How the Completable instance handles current position</nuxt-link> section for more info.
     * @type {Number}
     */
    const position = string.length

    assignEnumerables(this, {
      string,
      position
    }, 'property')

    /* Public getters */
    /**
     * Segment getter function
     * @return {String} An extracted segment of `string`. See the <nuxt-link to="#How-the-Completable-instance-extracts-segments">How the Completable instance extracts segments</nuxt-link> section for more info.
     */
    function segment() {
      return this.string.slice(
        this.#computeSegmentStartIndex(),
        this.#computeSegmentEndIndex()
      )
    }

    assignEnumerables(this, { segment }, 'getter')

    /* Public methods */
    /**
     * Sets a value for `string`
     * @param {String} string The new string
     * @return {Object}       The Completable instance
     */
    function setString(string) {
      this.string = string
      return this
    }
    /**
     * <p>Sets the position from which the Completable instance will start extracting segments.</p><p>See the <nuxt-link to="#How-the-Completable-instance-extracts-segments">How the Completable instance extracts segments</nuxt-link> section and the <nuxt-link to="#How-the-Completable-instance-handles-current-position">How the Completable instance handles current position</nuxt-link> section for more info.</p>
     * @param {Number} position The new `position`
     * @return {Object}       The Completable instance
     */
    function setPosition(position) {
      this.position = position
      return this
    }
    /**
     * <p>Completes the string, replacing <code>segment</code> with a completion/replacement string, and computes a new position based on the <code>positionsAfterCompletion</code> option. Afterward, <code>complete</code> calls the user-provided <code>onComplete</code> function, passing the new string and the new position.</p><p>Note that <code>complete</code> does not set its <code>string</code> or <code>position</code> to the new values, but the user can do so using <code>setString</code> and <code>setPosition</code>.</p>
     * @param {String} completion The completion/replacement.
     * @return {Object}       The Completable instance
     */
    function complete(completion) {
      const textBefore = this.#segmentsFromDivider ? this.string.slice(0, this.position - this.segment.length) : '',
            textAfter = this.#segmentsToPosition ? this.string.slice(this.position) : '',
            string = textBefore + completion + textAfter,
            position = this.#positionsAfterCompletion ? textBefore.length + completion.length : this.position

      if (is.function(this.#onComplete)) this.#onComplete(string, this)
      if (is.function(this.#onPosition)) this.#onPosition(position, this)

      return this
    }

    assignEnumerables(this, {
      setString,
      setPosition,
      complete
    }, 'method')
  }

  /* Private methods */
  #computeSegmentStartIndex = function() {
    return this.#segmentsFromDivider ? lastMatch(this.string, this.#divider, this.position) + 1 : 0
  }
  #computeSegmentEndIndex = function() {
    return this.#segmentsToPosition ? this.position : this.string.length
  }
}

export default Completable
