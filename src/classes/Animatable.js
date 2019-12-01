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

  constructor (elements) {
    /* Options */

    /* Public properties */
    this.elements = elements

    /* Dependency */
    this._dependency = {}
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
  animate (config) {
    // stop previous animation
    this._dependency = new Dependency(this.elements, config)
  }
  play () {
    try {
      this._dependency.play()
      return this
    } catch (error) {
      // warn(need to call animate first)
    }
  }
  pause () {
    try {
      this._dependency.pause()
      return this
    } catch (error) {
      // warn(need to call animate first)
    }
  }
  restart () {
    try {
      this._dependency.restart()
      return this
    } catch (error) {
      // warn(need to call animate first)
    }
  }
  reverse () {
    try {
      this._dependency.reverse()
      return this
    } catch (error) {
      // warn(need to call animate first)
    }
  }
  seek (timestamp) {
    try {
      this._dependency.seek(timestamp)
      return this
    } catch (error) {
      // warn(need to call animate first)
    }
  }

  /* Private methods */
}
