import { createReduceAsync } from './createReduceAsync'

import { createReduce } from './createReduce'
// PIPEABLE

export class Pipeable {
  constructor(private state: any) { }

  pipe(...fns: ((...args: any[]) => any)[]) {
    return createReduce<(...args: any[]) => any, any>((piped, fn, index) => fn(piped, index), this.state)(fns);
  }

  async pipeAsync(...fns: ((...args: any[]) => Promise<any>)[]): Promise<any> {
    return await createReduceAsync<any, any>(
      async (piped, fn, index) => await fn(piped, index),
      this.state
    )(fns);
  }
}
