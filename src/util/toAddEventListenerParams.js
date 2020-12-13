import createExceptAndOnlyListener from './createExceptAndOnlyListener.js'

export default function toAddEventListenerParams (listener, options) {
  const { addEventListener, useCapture, wantsUntrusted } = options,
        exceptAndOnlyListener = createExceptAndOnlyListener(listener, options),
        listenerOptions = [addEventListener || useCapture, wantsUntrusted]

  return { exceptAndOnlyListener, listenerOptions }
}

