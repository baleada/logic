export type GeneratorAsyncTransform<Parameter, Yielded> = (param: Parameter) => AsyncGenerator<Yielded>
