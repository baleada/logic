/* Dependencies */
import anime from 'animejs'

/* Util */
import { is, resolveOptions, warn } from '../util/functions'

export default class AnimatableAnime {
  // _elements
  // _animeApi
  // _dependency
  // _animeInstance

  constructor (elements, config = {}) {
    this._elements = elements

    this._dependency = anime

    this._animeApi = {
      // anime util
      path: this._dependency.path,
      setDashoffset: this._dependency.setDashoffset,
      stagger: this._dependency.stagger,
      penner: this._dependency.penner,

      // anime helpers
      remove: this._dependency.remove,
      get: this._dependency.get,
      set: this._dependency.set,
      random: this._dependency.random,
      // tick: this._dependency.tick, TODO: does this need another prop? https://animejs.com/documentation/_tick
      running: this._dependency.running,
    }

    this._animeInstance = this._getAnimeInstance(config)
  }

  get animation () {
    return this._animeInstance
  }

  /* Public methods */
  play () {
    this._animeInstance.play(...arguments)
  }
  pause () {
    this._animeInstance.pause(...arguments)
  }
  restart () {
    this._animeInstance.restart(...arguments)
  }
  reverse () {
    this._animeInstance.reverse(...arguments)
  }
  seek () {
    this._animeInstance.seek(...arguments)
  }

  /* Private methods */
  _getAnimeInstance = function(config) {
    config = resolveOptions(config, this._animeApi)

    warn('hasRequiredOptions', {
      received: config,
      required: ['animation', 'timelineChildren'],
      subject: 'Animatable',
      docs: 'https://baleada.netlify.com/docs/logic/classes/Animatable',
    })

    const instance = config.hasOwnProperty('timelineChildren')
      ? this._timeline(config)
      : this._animate(config)

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
  _animate = function({ animation = {} }) {
    return this._dependency({
      targets: this._elements,
      ...animation
    })
  }
  _timeline = function({ animation = {}, timelineChildren }) {
    const instance = this._dependency.timeline({
      targets: this._elements,
      ...animation
    })

    timelineChildren.forEach(child => {
      const childAddArgs = this._getAddArguments(child)
      instance.add(...childAddArgs)
    })

    return instance
  }
  _getAddArguments = function(child) {
    const childConfig = is.array(child) ? child[0] : child,
          offset = (child[1] === undefined) ? '+=0' : child[1] // As per the anime docs, if no offset is specifed, the animation should start after the previous animation ends.
    return [childConfig, offset]
  }
}
