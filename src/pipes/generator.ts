export type GeneratorFn<Parameter, Yielded> = (param: Parameter) => Generator<Yielded>
