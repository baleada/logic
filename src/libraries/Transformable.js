/*
 * Transformable.js
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

/* Dependencies */

/* Utils */

export default class Transformable {
  /* Private properties */
  #preservesMethods
  #onTransform

  constructor(elements, options = {}) {
    /* Options */
    options = {
      preservesMethods: true,
      ...options
    }
    this.#onTransform = options.onTransform

    /* Public properties */
    this.elements = elements

    /* Dependency */
  }

  /* Public getters */

  /* Public methods */
  setElements(elements) {
    this.elements = elements
    return this
  }
  translateX(x) {
    return this.#preservesMethods
      ? this.#transform({ name: 'translateX', args: [x] })
      : this.translate3d({ x, y: 0, z: 0 })
  }
  translateY(y) {
    return this.#preservesMethods
      ? this.#transform({ name: 'translateY', args: [y] })
      : this.translate3d({ x: 0, y, z: 0 })
  }
  translate({ x, y }) {
    return this.#preservesMethods
      ? this.#transform({ name: 'translate', args: [x, y] })
      : this.translate3d({ x, y, z: 0 })
  }
  translateZ(z) {
    return this.#preservesMethods
      ? this.#transform({ name: 'translateZ', args: [z] })
      : this.translate3d({ x: 0, y: 0, z })
  }
  translate3d({ x, y, z }) {
    return this.#transform({
      name: 'translate3d',
      args: [x, y, z],
    })
  }
  scaleX(x) {
    return this.#preservesMethods
      ? this.#transform({ name: 'scaleX', args: [x] })
      : this.scale3d({ x, y: 0, z: 0 })
  }
  scaleY(y) {
    return this.#preservesMethods
      ? this.#transform({ name: 'scaleY', args: [y] })
      : this.scale3d({ x: 0, y, z: 0 })
  }
  scale({ x, y }) {
    return this.#preservesMethods
      ? this.#transform({ name: 'scale', args: [x, y] })
      : this.scale3d({ x, y, z: 0 })
  }
  scaleZ(z) {
    return this.#preservesMethods
      ? this.#transform({ name: 'scaleZ', args: [z] })
      : this.scale3d({ x: 0, y: 0, z })
  }
  scale3d({ x, y, z }) {
    return this.#transform({
      name: 'scale3d',
      args: [x, y, z],
    })
  }
  rotateX(a) {
    return this.#preservesMethods
      ? this.#transform({ name: 'rotateX', args: [a] })
      : this.rotate3d({ x: 1, y: 0, z: 0, a })
  }
  rotateY(a) {
    return this.#preservesMethods
      ? this.#transform({ name: 'rotateY', args: [a] })
      : this.rotate3d({ x: 0, y: 1, z: 0, a })
  }
  rotate(a) {
    return this.#preservesMethods
      ? this.#transform({ name: 'rotate', args: [a] })
      : this.rotate3d({ x: 0, y: 0, z: 1, a })
  }
  rotateZ(z) {
    return this.#preservesMethods
      ? this.#transform({ name: 'rotateZ', args: [z] })
      : this.rotate3d({ x: 0, y: 0, z: 1, a })
  }
  rotate3d({ x, y, z, a }) {
    return this.#transform({
      name: 'rotate3d',
      args: [x, y, z, a],
    })
  }
  skewX(ax) {
    return this.#preservesMethods
      ? this.#transform({ name: 'skewX', args: [ax] })
      : this.skew({ ax, ay: 0 })
  }
  skewY(ay) {
    return this.#preservesMethods
      ? this.#transform({ name: 'skewY', args: [ay] })
      : this.skew({ ax: 0, ay })
  }
  skew({ ax, ay }) {
    return this.#transform({
      name: 'skew',
      args: [ax, ay],
    })
  }
  matrix({ a, b, c, d, tx, ty }) {
    return this.#preservesMethods
      ? this.#transform({ name: 'matrix', args: [a, b, c, d, tx, ty] })
      : this.matrix3d({ a, b, c1: 0, d1: 0, c, d, c2: 0, d2: 0, a3: 0, b3: 0, c3: 1, d3: 0, tx, ty, c4: 0, d4: 1 })
  }
  matrix3d({ a1, b1, c1, d1, a2, b2, c2, d2, a3, b3, c3, d3, a4, b4, c4, d4 }) {
    return this.#transform({
      name: 'matrix3d',
      args: [a1, b1, c1, d1, a2, b2, c2, d2, a3, b3, c3, d3, a4, b4, c4, d4],
    })
  }
  perspective(d) {
    return this.#transform({
      name: 'perspective',
      args: [d],
    })
  }

  /* Private methods */
  #transform = function({ name, args }) {
    if (is.function(this.#onTransform)) this.#onTransform({ name, args })
    return this
  }
}
