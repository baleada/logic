/*
 * asyncFilterable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

import asyncMapable from './asyncMapable.js'

export default function asyncFilterable (array) {
  const object = new Array(...array)

  object.asyncFilter = async filter => {
    const asyncMapped = await asyncMapable(array).asyncMap(filter)
    return asyncFilterable(array.filter((_, index) => asyncMapped[index]))
  }

  return object
}
