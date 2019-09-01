/*
 * Intersectable.js
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

/* Dependencies */

/* Utils */
import toNodeList from '../utils/toNodeList'

export default class Observable {
  #supportedObserverTypes
  #onIntersect
  #onMutate
  #onResize
  #intersectionObserverOptions
  #computedIntersectionObserver
  #computedMutationObserver
  #computedResizeObserver

  constructor(elements, options = {}) {
    /* Options */
    this.#onIntersect = options.onIntersect
    this.#onMutate = options.onMutate
    this.#onResize = options.onResize

    /* Public properties */
    this.elements = toNodeList(elements)

    /* Private properties */
    this.#supportedObserverTypes = ['intersection', 'mutation', 'resize']

    /* Dependency */
    this.#intersectionOptions = this.#getIntersectionOptions(options)
    this.#computedIntersection = is.function(this.#onIntersect)
      ? this.#getIntersection(this.#intersectionOptions)
      : null
    this.#computedMutation = is.function(this.#onMutate)
      ? this.#getMutation()
      : null
    this.#computedResize = is.function(this.#onResize)
      ? this.#getResize()
      : null
  }

  /* Public getters */
  get intersection() {
    return this.#computedIntersection
  }
  get mutation() {
    return this.#computedMutation
  }
  get resize() {
    return this.#computedResize
  }

  /* Public methods */
  setElements(elements) {
    this.elements = toNodeList(elements)
    return this
  }
  observe(options = {}) {
    this.elements.forEach(element => {
      this.#supportedObserverTypes.forEach(observerType => {
        if (!is.null(this.[`${observerType}`])) this[`${observerType}`].observe(element, options)
      })
    })
  }
  disconnect() {
    this.#supportedObserverTypes.forEach(observerType => {
      if (!is.null(this.[`${observerType}`])) this[`${observerType}`].disconnect()
    })
  }
  takeRecords() {
    this.#supportedObserverTypes.forEach(observerType => {
      if (!is.null(this.[`${observerType}`])) this[`${observerType}`].takeRecords()
    })
  }
  unobserve(element) {
    this.#supportedObserverTypes.forEach(observerType => {
      if (!is.null(this.[`${observerType}`])) this[`${observerType}`].unobserve(element)
    })
  }

  /* Private methods */
  #getIntersectionOptions = ({ onIntersect, onMutate, onResize, ...rest }) => rest
  #getIntersection = function(options) {
    return new IntersectionObserver(this.#onIntersect, options)
  }
  #getMutation = function() {
    return new MutationObserver(this.#onMutate)
  }
  #getResize = function() {
    return new ResizeObserver(this.#onResize)
  }
}
