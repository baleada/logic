export default function(required, options = {}) {
  const { object, properties } = required,
        { every = true } = options,
        method = every ? 'every' : 'some'

  return properties[method](property => object.hasOwnProperty(property))
}
