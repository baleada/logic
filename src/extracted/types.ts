import type { KeyStatuses } from './key-statuses'

export type DeepRequired<Object extends Record<any, any>> = {
  [Key in keyof Object]-?: Object[Key] extends Record<any, any> ? DeepRequired<Object[Key]> : Object[Key]
}

export type KeyStatusFunction<Returned> = (statuses: KeyStatuses) => Returned
