/*
 * asyncMapable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

import Resolveable from '../classes/Resolveable.js'

export default function asyncMapable (array) {
  const object = new Array(...array)

  object.asyncMap = async map => {
    const resolveable = new Resolveable(() => array.map(async (...args) => map(...args)))
    return asyncMapable((await resolveable.resolve()).response)
  }

  return object
}
