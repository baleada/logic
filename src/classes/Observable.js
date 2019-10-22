/*
 * Intersectable.js
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

/* Dependencies */

/* Util */
import is from '../util/is'
import toNodeList from '../util/toNodeList'

export default class Observable {
  // _supportedObserverTypes
  // _onIntersect
  // _onMutate
  // _onResize
  // _intersectionOptions
  // _computedIntersection
  // _computedMutation
  // _computedResize

  constructor (elements, options = {}) {
    /* Options */
    this._onIntersect = options.onIntersect
    this._onMutate = options.onMutate
    this._onResize = options.onResize

    /* Public properties */
    this.elements = toNodeList(elements)

    /* Private properties */
    this._supportedObserverTypes = ['intersection', 'mutation', 'resize']

    /* Dependency */
    this._intersectionOptions = this._getIntersectionOptions(options)
    this._computedIntersection = is.function(this._onIntersect)
      ? this._getIntersection(this._intersectionOptions)
      : null
    this._computedMutation = is.function(this._onMutate)
      ? this._getMutation()
      : null
    this._computedResize = is.function(this._onResize)
      ? this._getResize()
      : null
  }

  /* Public getters */
  get intersection () {
    return this._computedIntersection
  }
  get mutation () {
    return this._computedMutation
  }
  get resize () {
    return this._computedResize
  }

  /* Public methods */
  setElements (elements) {
    this.elements = toNodeList(elements)
    return this
  }
  observe (options = {}) {
    this.elements.forEach(element => {
      this._supportedObserverTypes.forEach(observerType => {
        if (!is.null(this[`${observerType}`])) {
          this[`${observerType}`].observe(element, options)
        }
      })
    })
  }
  disconnect () {
    this._supportedObserverTypes.forEach(observerType => {
      if (!is.null(this[`${observerType}`])) {
        this[`${observerType}`].disconnect()
      }
    })
  }
  takeRecords () {
    this._supportedObserverTypes.forEach(observerType => {
      if (!is.null(this[`${observerType}`])) {
        this[`${observerType}`].takeRecords()
      }
    })
  }
  unobserve (element) {
    this._supportedObserverTypes.forEach(observerType => {
      if (!is.null(this[`${observerType}`])) {
        this[`${observerType}`].unobserve(element)
      }
    })
  }

  /* Private methods */
  _getIntersectionOptions = ({ onIntersect, onMutate, onResize, ...rest }) => rest
  _getIntersection = function(options) {
    return new IntersectionObserver(this._onIntersect, options)
  }
  _getMutation = function() {
    return new MutationObserver(this._onMutate)
  }
  _getResize = function() {
    return new ResizeObserver(this._onResize)
  }
}
