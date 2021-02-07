/*
 * uniqueable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

export default function uniqueable (array) {
  const unique = () => {
    return uniqueable(Array.from(new Set(array)))
  }

  return { unique, value: array }
}
