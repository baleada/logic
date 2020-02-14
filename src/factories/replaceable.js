/*
 * replaceable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

export default function replaceable (array) {
  const object = new Array(...array)

  object.replace = ({ index, item }) => {
    const replaced = [
            ...object.slice(0, index),
            item,
            ...object.slice(index + 1),
          ]

    return replaceable(replaced)
  }
 
  return object
}
 