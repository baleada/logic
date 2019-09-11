/*
 * Renamable.js
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

export default class Renamable extends Map {
  renameKey (keyToRename, newName) {
    const keys = Array.from(this.keys()),
          keyToRenameIndex = keys.findIndex(key => key === keyToRename),
          newKeys = [...keys.slice(0, keyToRenameIndex), newName, ...keys.slice(keyToRenameIndex + 1)],
          values = Array.from(this.values())

    return new Map([
      ...newKeys.map((key, index) => [key, values[index]])
    ])
  }
}
