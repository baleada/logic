import clipable from './clipable.js'

export default function withMethods (factories, state, options = {}) {
  const methods = Object.entries(factories).reduce((methods, [name, factory]) => {
    const method = clipable(name).clip(/able$/).value

    return {
      ...methods,
      [method]: (...args) => withMethods(
        factories,
        factory(state, options[name])[method](...args).value,
        options,
      ),
    }
  }, {})
  

  return { ...methods, value: state }
}
