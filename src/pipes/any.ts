import { klona } from 'klona'
import { dequal } from 'dequal'

export type AnyTransform<Transformed> = (param: any) => Transformed

/**
 * [Docs](https://baleada.dev/docs/logic/pipes/clone)
 */
export function createClone<Any> (): AnyTransform<Any> {
  return any => {
    return klona(any)
  }
}

/**
 * [Docs](https://baleada.dev/docs/logic/pipes/deep-equal)
 */
export function createDeepEqual(compared: any): AnyTransform<boolean> {
  return any => dequal(any, compared)
}

/**
 * [Docs](https://baleada.dev/docs/logic/pipes/equal)
 */
export function createEqual (compared: any): AnyTransform<boolean> {
  return any => any === compared
}
