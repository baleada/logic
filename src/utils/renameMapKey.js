export default function renameMapKey (map, keyToRename, newKeyName) {
  const keys = Array.from(map.keys()),
        keyToRenameIndex = keys.findIndex(key => key === keyToRename),
        newKeys = [...keys.slice(0, keyToRenameIndex), newKeyName, ...keys.slice(keyToRenameIndex + 1)],
        values = Array.from(map.values())

  return new Map([
    ...newKeys.map((key, index) => [key, values[index]])
  ])
}
