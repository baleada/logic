/*
 * Animatable.js
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

/* Dependencies */
import Dependency from '../wrappers/AnimatableAnime'

/* Utils */
import is from '../utils/is'

class Animatable {
  /* Private properties */
  #dependencyOptions
  #dependency

  constructor(elements, options = {}) {
    /* Options */

    /* Public properties */
    this.elements = elements

    /* Dependency */
    this.#dependencyOptions = options
    this.#dependency = new Dependency(this.elements, this.#dependencyOptions)
  }

  /* Public getters */
  get animation() {
    return this.#dependency
  }

  /* Public methods */
  setElements(elements) {
    this.elements = elements
    this.#dependency = new Dependency(this.elements, this.#dependencyOptions)
    return this
  }
  play() {
    this.#dependency.play(...arguments)
    return this
  }
  pause() {
    this.#dependency.pause(...arguments)
    return this
  }
  restart() {
    this.#dependency.restart(...arguments)
    return this
  }
  reverse() {
    this.#dependency.reverse(...arguments)
    return this
  }
  seek() {
    this.#dependency.seek(...arguments)
    return this
  }

  /* Private methods */
}

export default Animatable
