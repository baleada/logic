/*
 * asyncMapable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

import toAsyncReduced from '../util/toAsyncReduced.js'

export default function asyncMapable (array) {
  const asyncMap = async map => {
    const asyncReduced = await toAsyncReduced({
      array,
      reducer: async (resolvedMaps, ...rest) => [...resolvedMaps, await map(...rest)],
      initialValue: []
    })
    return asyncMapable(asyncReduced)
  }

  return { asyncMap, array }
}
