/* Dependencies */
import anime from 'animejs'

/* Utils */
import is from '../utils/is'
import resolveOptions from '../utils/resolveOptions'

class AnimatableAnime {
  #elements
  #anime
  #animeApi

  constructor(elements, options = {}) {
    this.#elements = elements

    this.#anime = this.#animeConstructor(options)
    this.#animeApi = {
      // anime utils
      path: this.#anime.path,
      setDashoffset: this.#anime.setDashoffset,
      stagger: this.#anime.stagger,
      penner: this.#anime.penner,

      // anime helpers
      remove: this.#anime.remove,
      get: this.#anime.get,
      set: this.#anime.set,
      random: this.#anime.random,
      // tick: this.#anime.tick, TODO: does this need another prop? https://animejs.com/documentation/#tick
      running: this.#anime.running,
    }
  }

  /* Public methods */
  play() {
    console.log(this.#elements)
    this.#anime.play(...arguments)
  }
  pause() {
    this.#anime.pause(...arguments)
  }
  restart() {
    this.#anime.restart(...arguments)
  }
  reverse() {
    this.#anime.reverse(...arguments)
  }
  seek() {
    this.#anime.seek(...arguments)
  }

  /* Private methods */
  #animeConstructor = function (options) {
    options = resolveOptions(options, this.#animeApi)

    const instance = options.hasOwnProperty('timelineChildren')
      ? this.#timeline(options)
      : this.#animation(options)

    if (options.hasOwnProperty('speed')) instance.speed = options.speed

    instance.finished
      .then((response) => {
        if (options.hasOwnProperty('onFinishedSuccess')) options.onFinishedSuccess(response)
      })
      .catch((error) => {
        if (options.hasOwnProperty('onFinishedError')) options.onFinishedError(error)
      })

    console.log(instance)
    return instance
  }
  #animation = function ({ animation = {} }) {
    console.log(animation)
    return anime({
      targets: this.#elements,
      ...animation
    })
  }
  #timeline = function ({ animation = {}, timelineChildren }) {
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
  #getAddArguments = function (child) {
    const childConfig = is.array(child) ? child[0] : child
    const offset = (child[1] === undefined) ? '+=0' : child[1] // As per the anime docs, if no offset is specifed, the animation should start after the previous animation ends.
    return [childConfig, offset]
  }
}

export default AnimatableAnime
