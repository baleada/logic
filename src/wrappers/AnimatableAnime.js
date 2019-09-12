/* Dependencies */
import anime from 'animejs'

/* Utils */
import is from '../utils/is'
import resolveOptions from '../utils/resolveOptions'
import warn from '../utils/warn'

export default class AnimatableAnime {
  #elements
  #animeApi
  #dependency
  #animeInstance

  constructor (elements, options = {}) {
    this.#elements = elements

    this.#dependency = anime

    this.#animeApi = {
      // anime utils
      path: this.#dependency.path,
      setDashoffset: this.#dependency.setDashoffset,
      stagger: this.#dependency.stagger,
      penner: this.#dependency.penner,

      // anime helpers
      remove: this.#dependency.remove,
      get: this.#dependency.get,
      set: this.#dependency.set,
      random: this.#dependency.random,
      // tick: this.#dependency.tick, TODO: does this need another prop? https://animejs.com/documentation/#tick
      running: this.#dependency.running,
    }

    this.#animeInstance = this.#getAnimeInstance(options)
  }

  get animation () {
    return this.#animeInstance
  }

  /* Public methods */
  play () {
    this.#animeInstance.play(...arguments)
  }
  pause () {
    this.#animeInstance.pause(...arguments)
  }
  restart () {
    this.#animeInstance.restart(...arguments)
  }
  reverse () {
    this.#animeInstance.reverse(...arguments)
  }
  seek () {
    this.#animeInstance.seek(...arguments)
  }

  /* Private methods */
  #getAnimeInstance = function(options) {
    options = resolveOptions(options, this.#animeApi)

    warn('hasRequiredOptions', {
      received: options,
      required: ['animation', 'timelineChildren'],
      subject: 'Animatable',
      docs: 'https://baleada.netlify.com/docs/logic/Animatable',
    })

    const instance = options.hasOwnProperty('timelineChildren')
      ? this.#timeline(options)
      : this.#animate(options)

    if (options.hasOwnProperty('speed')) {
      instance.speed = options.speed
    }

    instance.finished
      .then((response) => {
        if (options.hasOwnProperty('onFinishedSuccess')) {
          options.onFinishedSuccess(response)
        }
      })
      .catch((error) => {
        if (options.hasOwnProperty('onFinishedError')) {
          options.onFinishedError(error)
        }
      })

    return instance
  }
  #animate = function({ animation = {} }) {
    return this.#dependency({
      targets: this.#elements,
      ...animation
    })
  }
  #timeline = function({ animation = {}, timelineChildren }) {
    const instance = this.#dependency.timeline({
      targets: this.#elements,
      ...animation
    })

    timelineChildren.forEach(child => {
      const childAddArgs = this.#getAddArguments(child)
      instance.add(...childAddArgs)
    })

    return instance
  }
  #getAddArguments = function(child) {
    const childConfig = is.array(child) ? child[0] : child,
          offset = (child[1] === undefined) ? '+=0' : child[1] // As per the anime docs, if no offset is specifed, the animation should start after the previous animation ends.
    return [childConfig, offset]
  }
}
