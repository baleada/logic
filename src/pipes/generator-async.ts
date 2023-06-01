export type AsyncGeneratorFn<Parameter, Yielded> = (param: Parameter) => AsyncGenerator<Yielded>
