/* Dependencies */
import Hammer from 'hammerjs'

/* Utils */
import resolveOptions from '../utils/resolveOptions'

export default class TouchableHammer {
  #allowsSelect
  #element
  #intendedTouches
  #hammer

  constructor (element, options = {}) {
    this.#allowsSelect = options.allowsSelect

    this.#element = element

    this.#hammerApi = {
      direction: {
        none:	1,
        left:	2,
        right:	4,
        up:	8,
        down:	16,
        horizontal:	6,
        vertical:	24,
        all: 30,
      },
      input: {
        start: 1,
        move: 2,
        end: 4,
        cancel: 8,
      }
    }
    this.#hammer = this.#hammerConstructor(options)
  }

  /* Public getters */
  get manager() {
    return this.#hammer
  }

  /* Public methods */
  listen(touchType, listener) {
    this.#hammer.on(touchType, evt => listener(evt, this.#hammerApi))
  }
  touch(touchType, data) {
    this.#hammer.emit(touchType, data)
  }
  destroy() {
    this.#hammer.destroy
  }

  /* Private methods */
  #hammerConstructor = function(options) {
    options = resolveOptions(options, this.#hammerApi)
    const instance = new Hammer(this.#element, options)
    if (this.#allowsSelect) delete this.hammer.defaults.cssProps.userSelect
    return instance
  }
}
