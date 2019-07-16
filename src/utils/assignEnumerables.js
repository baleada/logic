export default function assignEnumerables(instance, enumerables, type) {
  const keyDictionary = {
    property: 'value',
    method: 'value',
    getter: 'get'
  }

  Object.keys(enumerables)
    .forEach(enumerable => {
      const descriptor = {
        [keyDictionary[type]]: enumerables[enumerable],
        enumerable: true
      }

      if (type === 'property') descriptor.writable = true // Cannot both specify accessors AND a value or writable attribute

      Object.defineProperty(instance, enumerable, descriptor)
    })
}
