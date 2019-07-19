import is from '../utils/is'

export default function toProvisions(instance) {
  const publicProperties = {
    prototype: Object.getOwnPropertyNames(Object.getPrototypeOf(instance)).slice(1), // don't include constructor
    instance: Object.getOwnPropertyNames(instance)
  }

  return publicProperties.instance.concat(publicProperties.prototype) 
    .reduce(
      (provisions, property) => ({
        ...provisions,
        [property]: is.function(instance[property]) ? instance[property].bind(instance) : instance[property]
      }),
      {}
    )
}
