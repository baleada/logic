import emit from './emit'

export default function(mutatedState, type, instance, catchallEmitter, typedEmitters) {
  emit(catchallEmitter, mutatedState, instance)

  const { emitter: typedEmitter } = typedEmitters.find(({ type: currentType }) => currentType === type)
  emit(typedEmitter, mutatedState, instance)
}