namespace Recognizeable {
  export class Class<T> {
    constructor (sequence: T[], options?: Options)
  }

  export type Options = {
    maxSequenceLength?: true | number,
    handlers?: Record<any, (handlerApi: RecognizeableHandlerApi) => any>
  }
}

