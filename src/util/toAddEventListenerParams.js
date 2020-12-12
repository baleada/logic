import toExceptAndOnlyListener from './toExceptAndOnlyListener.js'

export default function toAddEventListenerParams (listener, options) {
  const { addEventListener, useCapture, wantsUntrusted } = options,
        exceptAndOnlyListener = toExceptAndOnlyListener(listener, options),
        listenerOptions = [addEventListener || useCapture, wantsUntrusted]

  return { exceptAndOnlyListener, listenerOptions }
}

