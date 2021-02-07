/*
 * replaceable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

export default function replaceable (array) {
  const replace = ({ index, item }) => {
    const replaced = [
            ...array.slice(0, index),
            item,
            ...array.slice(index + 1),
          ]

    return replaceable(replaced)
  }
 
  return { replace, value: array }
}
 