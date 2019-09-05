function hasEveryProperty (object, properties) {
  return properties.every(property => object.hasOwnProperty(property))
}

function hasSomeProperties (object, properties) {
  return properties.some(property => object.hasOwnProperty(property))
}

export {
  hasEveryProperty,
  hasSomeProperties,
}
