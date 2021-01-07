import clipable from './clipable.js'
import { isArray, isString, isMap } from '../util'

export default function withMethods (factories, state, options = {}) {
  const { object, type } = toMeta(state)

  Object.entries(factories).forEach(([name, factory]) => {
    const method = `${clipable(name).clip(/able$/)}`
    
    object[method] = (...args) => {
      return withMethods(
        factories,
        withoutMethods({
          invoked: factory(state, options[name])[method](...args),
          type,
        }),
        options
      )
    }
  })

  return object
}

function toMeta (state) {
  const { 0: type } = Object.entries(isByType).find(([_, is]) => is(state))
  return {
    type,
    object: toObjectsByType[type](state)
  }
}

const toObjectsByType = {
  array: array => new Array(...array),
  string: string => new String(string),
  map: map => new Map(map),
}

const isByType = {
  array: isArray,
  string: isString,
  map: isMap,
}

function withoutMethods({ invoked, type }) {
  return withoutMethodsByType[type](invoked)
}

const withoutMethodsByType = {
  array: invoked => [...invoked],
  string: invoked => `${invoked}`,
  map: invoked => new Map(...invoked),
}
