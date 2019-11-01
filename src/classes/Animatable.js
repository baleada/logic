/*
 * Animatable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

/* Dependencies */
import Dependency from '../wrappers/AnimatableAnime'

export default class Animatable {
  /* Private properties */
  // _dependencyOptions
  // _dependency

  constructor (elements, options = {}) {
    /* Options */

    /* Public properties */
    this.elements = elements

    /* Dependency */
    this._dependencyOptions = options
    this._dependency = new Dependency(this.elements, this._dependencyOptions)
  }

  /* Public getters */
  get animation () {
    return this._dependency.animation
  }

  /* Public methods */
  setElements (elements) {
    this.elements = elements
    this._dependency = new Dependency(this.elements, this._dependencyOptions)
    return this
  }
  play () {
    this._dependency.play()
    return this
  }
  pause () {
    this._dependency.pause()
    return this
  }
  restart () {
    this._dependency.restart()
    return this
  }
  reverse () {
    this._dependency.reverse()
    return this
  }
  seek (timestamp) {
    this._dependency.seek(timestamp)
    return this
  }

  /* Private methods */
}
