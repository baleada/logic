/*
 * Animatable.js
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

/* Dependencies */
import Dependency from '../wrappers/AnimatableAnime'

export default class Animatable {
  /* Private properties */
  #dependencyOptions
  #dependency

  constructor (elements, options = {}) {
    /* Options */

    /* Public properties */
    this.elements = elements

    /* Dependency */
    this.#dependencyOptions = options
    this.#dependency = new Dependency(this.elements, this.#dependencyOptions)
  }

  /* Public getters */
  get animation () {
    return this.#dependency.animation
  }

  /* Public methods */
  setElements (elements) {
    this.elements = elements
    this.#dependency = new Dependency(this.elements, this.#dependencyOptions)
    return this
  }
  play () {
    this.#dependency.play()
    return this
  }
  pause () {
    this.#dependency.pause()
    return this
  }
  restart () {
    this.#dependency.restart()
    return this
  }
  reverse () {
    this.#dependency.reverse()
    return this
  }
  seek (timestamp) {
    this.#dependency.seek(timestamp)
    return this
  }

  /* Private methods */
}
