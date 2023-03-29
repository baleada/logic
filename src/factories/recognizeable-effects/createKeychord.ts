import type { RecognizeableEffect } from "@baleada/logic"
import { createMatchesKeycombo as createMatches } from "@baleada/logic"
import { toHookApi } from '@extracted'
import type { HookApi } from '@extracted'

export type KeychordTypes = 'keydown'

export type KeychordMetadata = {
  keycombos: KeycomboMetadata[]
}

export type KeychordOptions = {
  maxInterval?: number,
  onDown?: KeychordHook,
  preventsDefaultUnlessDenied?: boolean,
}

export type KeychordHook = (api: KeychordHookApi) => any

export type KeychordHookApi = HookApi<KeychordTypes, KeychordMetadata>

type KeycomboMetadata = {
  name: string,
  time: number
}

const defaultOptions: KeychordOptions = {
  maxInterval: 5000, // VS Code default
  preventsDefaultUnlessDenied: true,
}

export function createKeychord (keycombos: string, options: KeychordOptions = {}) {
  const narrowedKeycombos = keycombos.split(' '),
        { maxInterval, preventsDefaultUnlessDenied, onDown } = { ...defaultOptions, ...options },
        cache: {
          currentKeycomboIndex: number,
          lastTimeStamp: number,
          wasRecognized: boolean
        } = {
          currentKeycomboIndex: 0,
          lastTimeStamp: 0,
          wasRecognized: false,
        }

  const keydown: RecognizeableEffect<'keydown', KeychordMetadata> = (event, api) => {
    if (cache.wasRecognized) {
      cleanup(event, api)
    }

    const { denied, getStatus } = api
    
    if (cache.lastTimeStamp === 0 || event.timeStamp - cache.lastTimeStamp > maxInterval) {
      cleanup(event, api)
    }

    cache.lastTimeStamp = event.timeStamp

    const keycombo = narrowedKeycombos[cache.currentKeycomboIndex]

    if (!createMatches(keycombo)(event)) {
      denied()
      cleanup(event, api)
      onDown?.(toHookApi(api))
      return
    }

    const { getMetadata } = api,
          metadata = getMetadata()

    if (!metadata.keycombos) {
      metadata.keycombos = []
    }

    metadata.keycombos.push({
      time: event.timeStamp,
      name: keycombo,
    })

    recognize(event, api)

    if (preventsDefaultUnlessDenied) {
      const status = getStatus()

      if (status === 'recognizing' || status === 'recognized') {
        event.preventDefault()
      }
    }

    onDown?.(toHookApi(api))
  }

  const recognize: RecognizeableEffect<'keydown', KeychordMetadata> = (event, api) => {
    const { recognized, getMetadata, } = api,
          metadata = getMetadata()

    // Wait for more keycombos if necessary.
    if (metadata.keycombos.length < narrowedKeycombos.length) {
      cache.currentKeycomboIndex += 1
      return
    }

    // Max intervals are all fine, and keycombos have been recognized in order.
    // It's recognized!
    recognized()
    cache.wasRecognized = true
  }

  const cleanup: RecognizeableEffect<'keydown', KeychordMetadata> = (event, api) => {
    const metadata = api.getMetadata()

    metadata.keycombos = []

    cache.currentKeycomboIndex = 0
    cache.wasRecognized = false
  }

  return { keydown }
}
