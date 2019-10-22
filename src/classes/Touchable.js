/*
 * Touchable.js
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

/* Dependencies */
import Dependency from '../wrappers/TouchableHammer'

/* Util */

export default class Touchable {
  // _dependencyOptions
  // _dependency

  constructor (element, options = {}) {
    /* Options */

    /* Public properties */
    this.element = element

    /* Private properties */

    /* Dependency */
    this._dependencyOptions = options
    this._dependency = new Dependency(this.element, this._dependencyOptions)
  }

  /* Public getters */
  get manager () {
    return this._dependency.manager
  }

  /* Public methods */
  setElement (element) {
    this.element = element
    return this
  }
  touch (touchType, data) {
    this._dependency.touch(touchType, data)
  }
  destroy () {
    this._dependency.destroy()
  }

  /* Private methods */
}
