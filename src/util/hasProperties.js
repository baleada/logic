export default function(required, options = {}) {
  const { object, properties } = required,
        { every } = options

  return every
    ? properties.every(property => object.hasOwnProperty(property))
    : properties.some(property => object.hasOwnProperty(property))
}
