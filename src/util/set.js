import get from './get.js'
import toKeys from './toKeys.js'

export default function set ({ object, path, value }) {
  toKeys(path).forEach((key, index, array) => {
    if (array.length === 1) {
      object[key] = value
      return
    }

    const p = toPath(array.slice(0, index))

    if (!p) {
      maybeAssign({
        gotten: object[key],
        key,
        assign: value => (object[key] = value)
      })
    } else {
      maybeAssign({
        gotten: get({ object, path: p }),
        key,
        assign: value => set({ object, path: p, value })
      })
    }

    if (index === array.length - 1) {
      get({ object, path: p })[key] = value
    }
  })
}

function toPath (keys) {
  return keys
    .map(key => typeof key === 'string' ? key : `${key}`)
    .reduce((path, key) => `${path}${'.' + key}`, '')
    .replace(/^\./, '')
}

function maybeAssign ({ gotten, key, assign }) {
  if (gotten === undefined) {
    switch (typeof key) {
      case 'number':
        assign([])
      case 'string':
        assign({})
    }
  }
}
