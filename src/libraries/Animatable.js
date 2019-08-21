/*
 * Animatable.js
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

/* Dependencies */
import AnimatableDependency from '../wrappers/AnimatableAnime'

/* Utils */
import is from '../utils/is'

class Animatable {
  /* Private properties */
  #onPlay
  #onPause
  #onRestart
  #onReverse
  #onSeek
  #dependencyOptions
  #dependency

  constructor(elements, options = {}) {
    /* Options */
    this.#onPlay = options.onPlay
    this.#onPause = options.onPause
    this.#onRestart = options.onRestart
    this.#onReverse = options.onReverse
    this.#onSeek = options.onSeek

    /* Public properties */
    this.elements = elements

    /* Dependency */
    this.#dependencyOptions = this.#getDependencyOptions(options)
    this.#dependency = new AnimatableDependency(this.elements, this.#dependencyOptions)
  }

  /* Public getters */

  /* Public methods */
  setElements(elements) {
    this.elements = elements
    return this
  }
  play() {
    this.#dependency.play(...arguments)
    if (is.function(this.#onPlay)) this.#onPlay()
  }
  pause() {
    this.#dependency.pause(...arguments)
    if (is.function(this.#onPause)) this.#onPause()
  }
  restart() {
    this.#dependency.restart(...arguments)
    if (is.function(this.#onRestart)) this.#onRestart()
  }
  reverse() {
    this.#dependency.reverse(...arguments)
    if (is.function(this.#onReverse)) this.#onReverse()
  }
  seek() {
    this.#dependency.seek(...arguments)
    if (is.function(this.#onSeek)) this.#onSeek()
  }

  /* Private methods */
  #getDependencyOptions = ({ onPlay, onPause, onRestart, onReverse, onSeek, ...rest }) => rest
}

export default Animatable
