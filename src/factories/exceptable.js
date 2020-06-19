/*
 * exceptable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

export default function exceptable (object) { 
  object.except = ({ key, keys }) => {
    const keysToRemove = keys || [key],
          excepted = Object.keys(object)
            .filter(k => !keysToRemove.includes(k))
            .reduce((excepted, k) => ({ ...excepted, [k]: object[k] }), {})

    return exceptable(excepted)
  }

  return object
}
