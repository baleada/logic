import is from './is'

export default function resolveOptions(rawOptions) {
  return is.function(rawOptions)
    ? rawOptions(...Array.from(arguments).slice(1))
    : rawOptions
}
