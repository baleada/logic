/*
 * asyncFilterable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

import asyncMapable from './asyncMapable.js'

export default function asyncFilterable (array) {
  const asyncFilter = async filter => {
    const asyncMapped = (await asyncMapable(array).asyncMap(filter)).value
    return asyncFilterable(array.filter((_, index) => asyncMapped[index]))
  }

  return { asyncFilter, value: array }
}
