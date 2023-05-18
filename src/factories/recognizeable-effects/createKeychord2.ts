import { find } from 'lazy-collections'
import { createMatchesKeycombo as createMatches, createMap } from "@baleada/logic"
import type { RecognizeableEffect } from "@baleada/logic"
import type { KeyreleaseMetadata } from '../createKeyrelease'
import { toHookApi, storeKeyboardTimeMetadata } from '@extracted'
import type { HookApi, KeyboardTimeMetadata } from '@extracted'

export type KeychordreleaseTypes = 'keydown' | 'keyup'

export type KeychordreleaseMetadata = {
  chronology: Omit<KeyreleaseMetadata, 'pressed'>[],
} & KeyboardTimeMetadata

export type KeychordreleaseOptions = {
  maxInterval?: number,
  minDuration?: number,
  preventsDefaultUnlessDenied?: boolean,
  onDown?: KeychordreleaseHook,
  onUp?: KeychordreleaseHook,
}

export type KeychordreleaseHook = (api: KeychordreleaseHookApi) => any

export type KeychordreleaseHookApi = HookApi<KeychordreleaseTypes, KeychordreleaseMetadata>

const defaultOptions: KeychordreleaseOptions = {
  maxInterval: 5000, // VS Code default
  minDuration: 0,
  preventsDefaultUnlessDenied: true,
}

export function createKeychordrelease (
  keychord: string,
  options: KeychordreleaseOptions = {}
) {
  const narrowedKeychord = keychord.split(' '),
        { maxInterval, minDuration, preventsDefaultUnlessDenied, onDown, onUp } = { ...defaultOptions, ...options },
        cleanup = (keycombo?: string) => {
          if (keycombo) {
            window.cancelAnimationFrame(requests[keycombo])
            return
          }

          for (const keycombo in requests) {
            window.cancelAnimationFrame(requests[keycombo])
          }
        },
        { [keycombo: string]: number } = {},
        statusesByKeycombo = createMap<typeof narrowedKeychord[0], status: 'ready' | 'down' | 'up'>(
          keycombo => 'ready'
        )(narrowedKeychord),
        eventsByKeycombo: { [keycombo: string]: KeyboardEvent } = {}

  let request: number

  const keydown: RecognizeableEffect<'keydown', KeychordreleaseMetadata> = (event, api) => {
    const { denied, getMetadata } = api,
          metadata = getMetadata(),
          [keycombo, index] = toKeycombo(event, metadata.chronology)

    if (!keycombo) {
      denied()
      onDown?.(toHookApi(api))
      return
    }

    if (preventsDefaultUnlessDenied) event.preventDefault()
    
    if (statusesByKeycombo[index][1] === 'down') return

    statusesByKeycombo[index][1] = 'down'
    eventsByKeycombo[keycombo] = event

    storeKeyboardTimeMetadata(
      event,
      {
        ...api,
        getMetadata: () => metadata.chronology[index],
        setMetadata: newMetadata => metadata.chronology[index] = newMetadata,
      },
      () => statusesByKeycombo[index][1] === 'down',
      newRequest => requests[keycombo] = newRequest,
    )

    onDown?.(toHookApi(api))
  }

  const keyup: RecognizeableEffect<'keyup', KeychordreleaseMetadata> = (event, api) => {
    const { getStatus } = api

    if (getStatus() === 'denied') {
      onUp?.(toHookApi(api))
      return
    }

    const keycombo = toKeycombo(event)

    if (keycombo) {
      statusesByKeycombo[keycombo] = 'up'
      delete eventsByKeycombo[keycombo]
      cleanup(keycombo)
    } else if (!!find(key => key === event.key)(['Shift', 'Control', 'Alt', 'Meta']) as boolean) {
      for (const k in eventsByKeycombo) {
        switch (event.key) {
          case 'Shift':
            eventsByKeycombo[k] = new KeyboardEvent('keydown', { ...eventsByKeycombo[k], shiftKey: false })
            break
          case 'Control':
            eventsByKeycombo[k] = new KeyboardEvent('keydown', { ...eventsByKeycombo[k], ctrlKey: false })
            break
          case 'Alt': 
            eventsByKeycombo[k] = new KeyboardEvent('keydown', { ...eventsByKeycombo[k], altKey: false })
            break
          case 'Meta':
            eventsByKeycombo[k] = new KeyboardEvent('keydown', { ...eventsByKeycombo[k], metaKey: false })
            break
        }
      }
      
      for (const k in statusesByKeycombo) {
        if (statusesByKeycombo[k] === 'down' && !createMatches(k)(eventsByKeycombo[k])) {
          statusesByKeycombo[k] = 'up'
          delete eventsByKeycombo[k]
          cleanup(k)
        }
      }
    }

    const { getMetadata } = api,
          metadata = getMetadata()

    metadata.pressed = toPressed(statusesByKeycombo)
    metadata.released = toReleased(statusesByKeycombo)
    statusesByKeycombo[metadata.released] = 'ready'

    recognize(event, api)

    let anyKeycomboIsDown = false
    for (const k in statusesByKeycombo) {
      if (statusesByKeycombo[k] === 'down') {
        anyKeycomboIsDown = true
        break
      }
    }

    if (!anyKeycomboIsDown) cleanup()

    onUp?.(toHookApi(api))    
  }

  const recognize: RecognizeableEffect<'keyup', KeychordreleaseMetadata> = (event, api) => {
    const { getMetadata, recognized, denied } = api,
          metadata = getMetadata()

    if (!metadata.released.length || metadata.duration < minDuration) {
      denied()
      return
    }

    recognized()
  }

  return {
    keydown,
    keyup,
  }
}

function toPressed (statusesByKeycombo: { [keycombo: string]: 'ready' | 'down' | 'up' }) {
  const keycombos: string[] = []
  for (const keycombo in statusesByKeycombo) {
    if (statusesByKeycombo[keycombo] === 'down') {
      keycombos.push(keycombo)
    }
  }
  return keycombos
}

function toReleased (statusesByKeycombo: { [keycombo: string]: 'ready' | 'down' | 'up' }) {
  for (const keycombo in statusesByKeycombo) {
    if (statusesByKeycombo[keycombo] === 'up') {
      return keycombo
    }
  }
}
