export type GeneratorTransform<Parameter, Yielded> = (param: Parameter) => Generator<Yielded>
