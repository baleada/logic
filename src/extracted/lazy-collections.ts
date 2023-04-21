import { find, findIndex } from 'lazy-collections'

export function at<T>(index: number) {
  if (index >= 0) {
    return function atFn(data: Iterable<T>) {
      return find<T>((_, i) => (i === index))(data) as T
    }
  }


  return function atFn(data: Iterable<T>) {
    return [...data].at(index)
  }
}

export function includes (searchElement: any, fromIndex?: number) {
  const resolvedFromIndex = (fromIndex && fromIndex >= 0) ? fromIndex : 0
  const predicate: Parameters<typeof findIndex>[0] = (element, index) => {
    if (index < resolvedFromIndex) return false
    return element === searchElement
  }

  return function includesFn(data: Iterable<any>) {
    const index = findIndex(predicate)(data) as number
    return index !== -1
  }
}

export function length () {
  return function lengthFn(data: Iterable<any>) {
    return [...data].length
  }
}
