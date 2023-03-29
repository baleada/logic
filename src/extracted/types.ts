export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

export type DeepRequired<Object extends Record<any, any>> = {
  [Key in keyof Object]-?: Object[Key] extends Record<any, any> ? DeepRequired<Object[Key]> : Object[Key]
}
