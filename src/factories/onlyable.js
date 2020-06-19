/*
 * onlyable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

 export default function onlyable (object) { 
  object.only = ({ key, keys }) => {
    const keysToInclude = keys || [key],
          onlyed = Object.keys(object)
            .filter(k => keysToInclude.includes(k))
            .reduce((onlyed, k) => ({ ...onlyed, [k]: object[k] }), {})

    return onlyable(onlyed)
  }

  return object
}
