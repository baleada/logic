export default function renameMapKey (map, keyToRename, newKeyName) {
  const keys = Array.from(map.keys()),
        keyToRenameIndex = keys.findIndex(key => key === keyToRename),
        newKeys = keys.splice(keyToRenameIndex, 1, newKeyName),
        values = map.values()

  return new Map([
    ...newKeys.map((key, index) => [key, values[index]])
  ])
}
