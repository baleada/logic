export type FunctionTransform<Fn extends Function, Returned> = (param: Fn) => Returned

export function createTry<Optimistic, Pessimistic extends Error>(): FunctionTransform<() => Optimistic, Optimistic | Pessimistic> {
  return fn => {
    try {
      return fn()
    } catch (error) {
      return error
    }
  }
}
