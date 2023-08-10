import { klona } from 'klona'
import { dequal } from 'dequal'

export type AnyTransform<Transformed> = (param: any) => Transformed

export function createClone<Any> (): AnyTransform<Any> {
  return any => {
    return klona(any)
  }
}

export function createDeepEqual(compared: any): AnyTransform<boolean> {
  return any => dequal(any, compared)
}

export function createEqual (compared: any): AnyTransform<boolean> {
  return any => any === compared
}
