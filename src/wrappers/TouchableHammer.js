/* Dependencies */
import Hammer from 'hammerjs'

/* Utils */
import resolveOptions from '../utils/resolveOptions'
import capitalize from '../utils/capitalize'

export default class TouchableHammer {
  #allowsSelect
  #callbacks
  #element
  #intendedTouches
  #hammerApi
  #dependency
  #hammerOptions
  #hammer

  constructor (element, options = {}) {
    this.#allowsSelect = options.allowsSelect
    this.#callbacks = this.#getCallbacks(options)

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
    this.#dependency = Hammer
    this.#hammerOptions = this.#getHammerOptions(options)
    this.#hammer = this.#hammerConstructor(this.#hammerOptions)
  }

  /* Public getters */
  get manager () {
    return this.#hammer
  }

  /* Public methods */
  touch (touchType, data) {
    this.#hammer.emit(touchType, data)
  }
  destroy () {
    this.#hammer.destroy()
  }

  /* Private methods */
  #getCallbacks = ({ allowsSelect, ...rest }) => ({ ...rest })
  #getHammerOptions = function(options) {
    const nonHammerOptions = ['allowsSelect', ...Object.keys(this.#callbacks)]
    return Object.keys(options).reduce((hammerOptions, option) => {
      if (!nonHammerOptions.includes(option)) {
        hammerOptions[option] = options[option]
      }
      return hammerOptions
    }, {})
  }
  #hammerConstructor = function(options) {
    options = resolveOptions(options, this.#hammerApi)

    if (this.#allowsSelect) {
      delete this.#dependency.defaults.cssProps.userSelect
    }

    const instance = new this.#dependency(this.#element, options),
          events = Object.keys(this.#callbacks).map(callback => callback.slice(2).toLowerCase())

    events.forEach(evt => instance.on(evt, e => this.#callbacks[`on${capitalize(evt)}`](e)))

    return instance
  }
}
