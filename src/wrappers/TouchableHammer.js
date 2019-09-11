/* Dependencies */
import Hammer from 'hammerjs'

/* Utils */
import resolveOptions from '../utils/resolveOptions'

export default class TouchableHammer {
  #allowsSelect
  #element
  #intendedTouches
  #hammerApi
  #hammer

  constructor (element, options = {}) {
    this.#allowsSelect = options.allowsSelect

    this.#element = element

    this.#hammerApi = {
      directions: {
        none: 1,
        left: 2,
        right: 4,
        up: 8,
        down: 16,
        horizontal: 6,
        vertical: 24,
        all: 30,
      },
      inputs: {
        start: 1,
        move: 2,
        end: 4,
        cancel: 8,
      }
    }
    this.#hammer = this.#hammerConstructor(options)
  }

  /* Public getters */
  get manager () {
    return this.#hammer
  }

  /* Public methods */
  on (touchType, listener) {
    this.#hammer.on(touchType, evt => listener(evt, this.#hammerApi))
  }
  touch (touchType, data) {
    this.#hammer.emit(touchType, data)
  }
  destroy () {
    this.#hammer.destroy()
  }

  /* Private methods */
  #hammerConstructor = function(options) {
    options = resolveOptions(options, this.#hammerApi)
    if (this.#allowsSelect) {
      delete Hammer.defaults.cssProps.userSelect
    }
    const instance = new Hammer(this.#element, options)
    return instance
  }
}
