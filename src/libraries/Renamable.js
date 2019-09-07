/*
 * Renamable.js
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

/* Dependencies */

/* Utils */
import is from '../utils/is'
import renameMapKey from '../utils/renameMapKey'

export default class Renamable {
  #onRename

  constructor (map, options = {}) {
    /* Options */
    this.#onRename = options.onRename

    /* Public properties */
    this.map = map

    /* Private properties */

    /* Dependency */
  }

  /* Public getters */

  /* Public methods */
  setMap (map) {
    this.map = map
    return this
  }
  rename (keyToRename, newKeyName) {
    const newMap = renameMapKey(this.map, keyToRename, newKeyName)
    if (is.function(this.#onRename)) {
      this.#onRename(newMap)
    }
    return this
  }

  /* Private methods */
}
