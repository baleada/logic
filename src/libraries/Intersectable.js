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
    this.#intersectionObserverOptions = this.#getIntersectionObserverOptions(options)
    this.#computedIntersectionObserver = is.function(this.#onIntersect)
      ? this.#getIntersectionObserver(this.#intersectionObserverOptions)
      : undefined
    this.#computedMutationObserver = is.function(this.#onMutate)
      ? this.#getMutationObserver()
      : undefined
    this.#computedResizeObserver = is.function(this.#onResize)
      ? this.#getResizeObserver()
      : undefined
  }

  /* Public getters */
  get intersectionObserver() {
    return this.#computedIntersectionObserver
  }
  get mutationObserver() {
    return this.#computedMutationObserver
  }
  get resizeObserver() {
    return this.#computedResizeObserver
  }

  /* Public methods */
  setElements(elements) {
    this.elements = toNodeList(elements)
    return this
  }
  observe(options = {}) {
    this.elements.forEach(element => {
      this.#supportedObserverTypes.forEach(observerType => {
        this[`${observerType}Observer`].observe(element, options)
      })
    })
  }

  /* Private methods */
  #getIntersectionObserverOptions = ({ onIntersect, onMutate, onResize, ...rest }) => rest
  #getIntersectionObserver = function(options) {
    return new IntersectionObserver(this.#onIntersect, options)
  }
  #getMutationObserver = function() {
    return new MutationObserver(this.#onMutate)
  }
  #getResizeObserver = function() {
    return new ResizeObserver(this.#onResize)
  }
}
