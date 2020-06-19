/*
 * uniqueable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

export default function uniqueable (array) {
  const object = new Array(...array)

  object.unique = () => {
    return uniqueable(Array.from(new Set(object)))
  }

  return object
}
