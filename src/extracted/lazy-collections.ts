export function toLength () {
  return function toLengthFn(data: Iterable<any>) {
    return [...data].length
  }
}
