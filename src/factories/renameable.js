/*
 * renameable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

import replaceable from './replaceable.js'

export default function renameable (map) {
  const rename = ({ from, to }) => {
    const keys = [...map.keys()],
          keyToRenameIndex = keys.findIndex(k => k === from),
          newKeys = replaceable(keys).replace({ index: keyToRenameIndex, item: to }).value,
          values = [...map.values()],
          renamed = newKeys.reduce((renamed, key, index) => renamed.set(key, values[index]), new Map())

    return renameable(renamed)
  }

  return { rename, value: map }
}
