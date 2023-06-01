import { klona } from 'klona'
import { dequal } from 'dequal'

export type AnyFn<Returned> = (param: any) => Returned

export function createClone<Any> (): AnyFn<Any> {
  return any => {
    return klona(any)
  }
}

export function createEqual(compared: any): AnyFn<boolean> {
  return any => dequal(any, compared)
}
