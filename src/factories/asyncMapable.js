/*
 * asyncMapable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

import { toAsyncReduced } from '../util'

export default function asyncMapable (array) {
  const object = new Array(...array)

  object.asyncMap = async map => {
    const asyncReduced = await toAsyncReduced({
      array,
      reducer: async (resolvedMaps, ...rest) => [...resolvedMaps, await map(...rest)],
      initialValue: []
    })
    return asyncMapable(asyncReduced)
  }

  return object
}
