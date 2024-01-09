// Many of these functions are preferable to Object.<something> for better type inference
// on objects with no risk of type-unsafe keys being added dynamically
import { merge } from 'dset/merge'
import { createClone } from './any'

type ObjectTransform<Type extends Record<any, any>, Transformed> = (transform: Type) => Transformed

type ValueOf<Type> = Type[keyof Type]

/**
 * [Docs](https://baleada.dev/docs/logic/pipes/value)
 */
export function createValue<Type extends Record<any, any>>(key: keyof Type): ObjectTransform<Type, ValueOf<Type>> {
  return object => object[key]
}

/**
 * [Docs](https://baleada.dev/docs/logic/pipes/has)
 */
export function createHas<Type extends Record<any, any>>(key: keyof Type): ObjectTransform<Type, boolean> {
  return object => key in object
}

/**
 * [Docs](https://baleada.dev/docs/logic/pipes/keys)
 */
export function createKeys<Type extends Record<any, any>>(): ObjectTransform<Type, (keyof Type)[]> {
  return object => {
    const keys = []

    for (const key in object) {
      keys.push(key)
    }

    return keys
  }
}

/**
 * [Docs](https://baleada.dev/docs/logic/pipes/values)
 */
export function createValues<Type extends Record<any, any>>(): ObjectTransform<Type, ValueOf<Type>[]> {
  return object => {
    const values = []

    for (const key in object) {
      values.push(object[key])
    }

    return values
  }
}

/**
 * [Docs](https://baleada.dev/docs/logic/pipes/entries)
 */
export function createEntries<Type extends Record<any, any>>(): ObjectTransform<Type, [keyof Type, ValueOf<Type>][]> {
  return object => {
    const entries = []

    for (const key in object) {
      entries.push([key, object[key]])
    }

    return entries
  }
}

/**
 * [Docs](https://baleada.dev/docs/logic/pipes/every)
 */
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

/**
 * [Docs](https://baleada.dev/docs/logic/pipes/some)
 */
export function createSome<Type extends Record<any, any>>(predicate: (key: keyof Type, value: ValueOf<Type>) => unknown): ObjectTransform<Type, boolean> {
  return object => {
    for (const key in object) {
      if (predicate(key, object[key])) return true
    }

    return false
  }
}

/**
 * [Docs](https://baleada.dev/docs/logic/pipes/deep-merge)
 */
export function createDeepMerge<Type extends Record<any, any>>(override?: Type): ObjectTransform<Type, Type> {
  return object => {
    const merged: Type = createClone<typeof object>()(object)
    return merge(merged, override || {})
  }
}

export type CreateFindOptions<Conditions extends any[]> = {
  priority?: Conditions[number][],
}

// /**
//  * [Docs](https://baleada.dev/docs/logic/pipes/find)
//  */
// export function createFind<Type extends Record<any, any>>(
//   predicate: (key: keyof Type, value: ValueOf<Type>) => unknown,
//   options: CreateFindOptions<(keyof Type)[]> = {}
// ): ObjectTransform<Type, [keyof Type, ValueOf<Type>]> {
//   const { priority = createKeys()(predicate) } = options

//   return object => {
//     for (const c of priority) {
//       if (predicate(c, object[c])) return [c, object[c]]
//     }
//   }
// }

// /**
//  * [Docs](https://baleada.dev/docs/logic/pipes/find2)
//  */
// export function createFind2<Value extends any, ByState extends Record<any, Value>>(
//   defaultValue: Value,
//   byState: Partial<ByState>,
//   options: CreateFindOptions<(keyof ByState)[]> = {},
// ): ObjectTransform<Record<keyof ByState, boolean>, Value> {
//   const find = createFind<Record<keyof ByState, boolean>>(
//     (key, value) => value,
//     options,
//   )

//   return object => {
//     return byState[find(object)?.[0]] ?? defaultValue
//   }
// }

/**
 * [Docs](https://baleada.dev/docs/logic/pipes/omit)
 */
export function createOmit<Type extends Record<any, any>, Omitted extends keyof Type = keyof Type>(keys: Omitted[]): ObjectTransform<Type, Omit<Type, Omitted>> {
  return object => {
    const omitted = { ...object }

    for (const key of keys) {
      delete omitted[key]
    }

    return omitted
  }
}

/**
 * [Docs](https://baleada.dev/docs/logic/pipes/pick)
 */
export function createPick<Type extends Record<any, any>, Picked extends keyof Type = keyof Type>(keys: Picked[]): ObjectTransform<Type, Pick<Type, Picked>> {
  return object => {
    const picked = {} as Pick<Type, Picked>

    for (const key of keys) {
      picked[key] = object[key]
    }

    return picked
  }
}
