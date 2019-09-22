/* Dependencies */
import Hammer from 'hammerjs'

/* Util */
import resolveOptions from '../util/resolveOptions'
import capitalize from '../util/capitalize'
import is from '../util/is'

export default class TouchableHammer {
  #allowsSelect
  #blacklist
  #whitelist
  #callbacks
  #element
  #hammerApi
  #dependency
  #hammerOptions
  #hammerInstance

  constructor (element, options = {}) {
    this.#allowsSelect = options.allowsSelect
    this.#blacklist = options.blacklist
    this.#whitelist = options.whitelist
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
    this.#hammerInstance = this.#getHammerInstance(this.#hammerOptions)
  }

  /* Public getters */
  get manager () {
    return this.#hammerInstance
  }

  /* Public methods */
  touch (touchType, data) {
    this.#hammerInstance.emit(touchType, data)
  }
  destroy () {
    this.#hammerInstance.destroy()
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
  #getHammerInstance = function(options) {
    options = resolveOptions(options, this.#hammerApi)

    if (this.#allowsSelect) {
      delete this.#dependency.defaults.cssProps.userSelect
    }

    const instance = new this.#dependency(this.#element, options),
          events = Object.keys(this.#callbacks).map(callback => callback.slice(2).toLowerCase())

    events.forEach(evt => instance.on(evt, e => {
      let shouldCallback
      if (is.array(this.#blacklist)) {
        shouldCallback = !this.#blacklist.some(selector => e.target.matches(selector))
      }
      if (is.array(this.#whitelist)) {
        shouldCallback = this.#whitelist.some(selector => e.target.matches(selector))
      }

      if (shouldCallback) {
        this.#callbacks[`on${capitalize(evt)}`](e)
      }
    }))

    return instance
  }
}
