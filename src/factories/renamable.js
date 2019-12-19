/*
 * renamable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

export default function renamable (map) {
  const object = new Map(map)

  object.rename = (key, newName) => {
    const keys = Array.from(object.keys()),
          keyToRenameIndex = keys.findIndex(k => k === key),
          newKeys = [...keys.slice(0, keyToRenameIndex), newName, ...keys.slice(keyToRenameIndex + 1)],
          values = Array.from(object.values()),
          renamed = newKeys.reduce((renamed, key, index) => renamed.set(key, values[index]), new Map())

    return renamable(renamed)
  }

  return object
}
