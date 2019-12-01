/* Dependencies */
import anime from 'animejs'

/* Util */
import is from '../util/is'
import resolveOptions from '../util/resolveOptions'
import warn from '../util/warn'

export default class AnimatableAnime {
  #elements
  #animeApi
  #dependency
  #animeInstance

  constructor (elements, config = {}) {
    this.#elements = elements

    this.#dependency = anime

    this.#animeApi = {
      // anime util
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

    this.#animeInstance = this.#getAnimeInstance(config)
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
  #getAnimeInstance = function(config) {
    config = resolveOptions(config, this.#animeApi)

    warn('hasRequiredOptions', {
      received: config,
      required: ['animation', 'timelineChildren'],
      subject: 'Animatable',
      docs: 'https://baleada.netlify.com/docs/logic/classes/Animatable',
    })

    const instance = config.hasOwnProperty('timelineChildren')
      ? this.#timeline(config)
      : this.#animate(config)

    if (config.hasOwnProperty('speed')) {
      instance.speed = config.speed
    }

    instance.finished
      .then((response) => {
        if (config.hasOwnProperty('onFinishedSuccess')) {
          config.onFinishedSuccess(response)
        }
      })
      .catch((error) => {
        if (config.hasOwnProperty('onFinishedError')) {
          config.onFinishedError(error)
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
