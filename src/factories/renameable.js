/*
 * renameable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

import replaceable from './replaceable'

export default function renameable (map) {
  const object = new Map(map)

  object.rename = ({ from, to }) => {
    const keys = Array.from(object.keys()),
          keyToRenameIndex = keys.findIndex(k => k === from),
          newKeys = replaceable(keys).replace({ index: keyToRenameIndex, item: to }),
          values = Array.from(object.values()),
          renamed = newKeys.reduce((renamed, key, index) => renamed.set(key, values[index]), new Map())

    return renameable(renamed)
  }

  return object
}
