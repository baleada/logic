/**
 * Binds methods to an instance
 * @param  {Object} instance The instance to which methods will be bound
 * @param  {Array} methods   The methods that should be bound
 * @return {Object}          An object with one property for each bound method
 */
export default function bindMethods(instance, methods) {
  return methods
    .reduce(
      (boundMethods, method) => ({
        ...boundMethods,
        [method]: instance[method].bind(instance)
      }),
      {}
    )
}
