export type AsyncGeneratorTransform<Parameter, Yielded> = (param: Parameter) => AsyncGenerator<Yielded>
