import is from './is'

export default function(callback, mutatedState, instance) {
  if (is.function(callback)) {
    callback(mutatedState, instance)
  }
}
