import array from './array.js'

export default function map (state) {
  return new NormalizeableMap(state)
}

class NormalizeableMap extends Map {
  normalize () {
    return new Map(this)
  }

  rename ({ from, to }) {
    const keys = [...this.keys()],
          keyToRenameIndex = keys.findIndex(k => k === from),
          newKeys = array(keys).replace({ index: keyToRenameIndex, item: to }),
          values = [...this.values()],
          renamed = newKeys.reduce((renamed, key, index) => renamed.set(key, values[index]), new Map())

    return map(renamed)
  }
}
