import is from './is'

export default function(emitter, mutatedState, instance) {
  if (is.function(emitter)) {
    emitter(mutatedState, instance)
  }
}
