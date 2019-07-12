export default function assignPublicMethods(instance, methods) {
  Object.keys(methods)
    .forEach(method => {
      Object.defineProperty(instance, method, {
        value: methods[method],
        enumerable: true
      })
    })
}
