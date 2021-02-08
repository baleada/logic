/*
 * asyncForEachable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

 import toAsyncReduced from '../util/toAsyncReduced.js'

 export default function asyncForEachable (array) {
   const asyncForEach = async forEach => {
     await toAsyncReduced({
       array,
       reducer: async (_, ...rest) => await forEach(...rest),
     })
     return asyncForEachable(array)
   }
 
   return { asyncForEach, array }
 }
 