export function predicateArray (value: unknown): value is any[] {
  return Array.isArray(value)
}

export function predicateUndefined (value: unknown): value is undefined {
  return value === undefined
}

export function predicateFunction (value: unknown): value is (...args: any[]) => any {
  return typeof value === 'function'
}

export function predicateNull (value: unknown): value is null {
  return value === null
}

export function predicateNumber (value: unknown): value is number {
  return typeof value === 'number'
}

export function predicateString (value: unknown): value is string {
  return typeof value === 'string'
}

export function predicateObject (value: unknown): value is Record<any, any> {
  return typeof value === 'object'
}
