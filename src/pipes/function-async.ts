export type AsyncFunctionTransform<Fn extends Function, Returned> = (param: Fn) => Promise<Returned>

export function createTryAsync<Optimistic, Pessimistic extends Error>(): AsyncFunctionTransform<() => Promise<Optimistic>, Optimistic | Pessimistic> {
  return async fn => {
    try {
      return await fn()
    } catch (error) {
      return error
    }
  }
}
