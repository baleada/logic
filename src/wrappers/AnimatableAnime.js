/* Dependencies */
import anime from 'animejs'

/* Utils */
import is from '../utils/is'
import resolveOptions from '../utils/resolveOptions'
import warn from '../utils/warn'

export default class AnimatableAnime {
  #elements
  #animeApi
  #anime

  constructor (elements, options = {}) {
    this.#elements = elements

    this.#animeApi = {
      // anime utils
      path: anime.path,
      setDashoffset: anime.setDashoffset,
      stagger: anime.stagger,
      penner: anime.penner,

      // anime helpers
      remove: anime.remove,
      get: anime.get,
      set: anime.set,
      random: anime.random,
      // tick: anime.tick, TODO: does this need another prop? https://animejs.com/documentation/#tick
      running: anime.running,
    }

    this.#anime = this.#animeConstructor(options)
  }

  get animation () {
    return this.#anime
  }

  /* Public methods */
  play () {
    this.#anime.play(...arguments)
  }
  pause () {
    this.#anime.pause(...arguments)
  }
  restart () {
    this.#anime.restart(...arguments)
  }
  reverse () {
    this.#anime.reverse(...arguments)
  }
  seek () {
    this.#anime.seek(...arguments)
  }

  /* Private methods */
  #animeConstructor = function(options) {
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
    return anime({
      targets: this.#elements,
      ...animation
    })
  }
  #timeline = function({ animation = {}, timelineChildren }) {
    const instance = anime.timeline({
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
