// Many of these functions are preferable to Object.<something> for better type inference
// on objects with no risk of type-unsafe keys being added dynamically
import { merge } from 'dset/merge'
import { createClone } from './any'

type ObjectTransform<Type extends Record<any, any>, Transformed> = (transform: Type) => Transformed

type ValueOf<Type> = Type[keyof Type]

export function createValue<Type extends Record<any, any>>(key: keyof Type): ObjectTransform<Type, ValueOf<Type>> {
  return object => object[key]
}

export function createHas<Type extends Record<any, any>>(key: keyof Type): ObjectTransform<Type, boolean> {
  return object => key in object
}

export function createKeys<Type extends Record<any, any>>(): ObjectTransform<Type, (keyof Type)[]> {
  return object => {
    const keys = []

    for (const key in object) {
      keys.push(key)
    }

    return keys
  }
}

export function createValues<Type extends Record<any, any>>(): ObjectTransform<Type, ValueOf<Type>[]> {
  return object => {
    const values = []

    for (const key in object) {
      values.push(object[key])
    }

    return values
  }
}

export function createEntries<Type extends Record<any, any>>(): ObjectTransform<Type, [keyof Type, ValueOf<Type>][]> {
  return object => {
    const entries = []

    for (const key in object) {
      entries.push([key, object[key]])
    }

    return entries
  }
}

export function createEvery<Type extends Record<any, any>>(predicate: (key: keyof Type, value: ValueOf<Type>) => unknown): ObjectTransform<Type, boolean> {
  return object => {
    for (const key in object) {
      if (!predicate(key, object[key])) {
        return false
      }
    }

    return true
  }
}

export function createSome<Type extends Record<any, any>>(predicate: (key: keyof Type, value: ValueOf<Type>) => unknown): ObjectTransform<Type, boolean> {
  return object => {
    for (const key in object) {
      if (predicate(key, object[key])) return true
    }

    return false
  }
}

export function createDeepMerge<Type extends Record<any, any>>(override?: Type): ObjectTransform<Type, Type> {
  return object => {
    const merged: Type = createClone<typeof object>()(object)
    return merge(merged, override || {})
  }
}
