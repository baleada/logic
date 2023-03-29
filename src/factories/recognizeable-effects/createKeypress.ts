import { find } from 'lazy-collections'
import { RecognizeableEffect, createMatchesKeycombo as createMatches } from "@baleada/logic"
import { toHookApi, storeKeyboardTimeMetadata } from '@extracted'
import type { HookApi, KeyboardTimeMetadata } from '@extracted'

export type KeypressTypes = 'keydown' | 'keyup'

export type KeypressMetadata = {
  pressed: string[],
} & KeyboardTimeMetadata

export type KeypressOptions = {
  minDuration?: number,
  preventsDefaultUnlessDenied?: boolean,
  onDown?: KeypressHook,
  onUp?: KeypressHook
}

export type KeypressHook = (api: KeypressHookApi) => any

export type KeypressHookApi = HookApi<KeypressTypes, KeypressMetadata>

const defaultOptions: KeypressOptions = {
  minDuration: 0,
  preventsDefaultUnlessDenied: true,
}

export function createKeypress (
  keycomboOrKeycombos: string | string[],
  options: KeypressOptions = {}
) {
  const { minDuration, preventsDefaultUnlessDenied, onDown, onUp } = { ...defaultOptions, ...options },
        narrowedKeycombos = Array.isArray(keycomboOrKeycombos) ? keycomboOrKeycombos : [keycomboOrKeycombos],
        toKeycombo = (event: KeyboardEvent) => find<typeof narrowedKeycombos[0]>(
          narrowedKeycombo => createMatches(narrowedKeycombo)(event)
        )(narrowedKeycombos) as string,
        cleanup = (keycombo?: string) => {
          if (keycombo) {
            window.cancelAnimationFrame(requests[keycombo])
            return
          }

          for (const keycombo in requests) {
            window.cancelAnimationFrame(requests[keycombo])
          }
        },
        requests: { [keycombo: string]: number } = {},
        statusesByKeycombo: { [keycombo: string]: 'down' | 'up' } = {},
        eventsByKeycombo: { [keycombo: string]: KeyboardEvent } = {}

  const keydown: RecognizeableEffect<'keydown', KeypressMetadata> = (event, api) => {
    const { denied } = api,
          keycombo = toKeycombo(event)

    if (!keycombo) {
      denied()
      onDown?.(toHookApi(api))
      return
    }

    if (preventsDefaultUnlessDenied) event.preventDefault()

    if (statusesByKeycombo[keycombo] === 'down') return

    const { getMetadata } = api,
          metadata = getMetadata()

    statusesByKeycombo[keycombo] = 'down'
    eventsByKeycombo[keycombo] = event
    metadata.pressed = toPressed(statusesByKeycombo)

    storeKeyboardTimeMetadata(
      event,
      api,
      () => statusesByKeycombo[keycombo] === 'down',
      newRequest => requests[keycombo] = newRequest,
      recognize
    )

    onDown?.(toHookApi(api))
  }

  const recognize: RecognizeableEffect<'keydown', KeypressMetadata> = (event, api) => {
    const { getMetadata, recognized } = api,
          metadata = getMetadata()

    if (metadata.duration >= minDuration) recognized()
  }

  const keyup: RecognizeableEffect<'keyup', KeypressMetadata> = (event, api) => {
    const { getStatus } = api,
          status = getStatus()

    if (status === 'denied') {
      onUp?.(toHookApi(api))
      return
    }

    const { denied } = api,
          keycombo = toKeycombo(event)

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

    let anyKeycomboIsDown = false
    for (const k in statusesByKeycombo) {
      if (statusesByKeycombo[k] === 'down') {
        anyKeycomboIsDown = true
        break
      }
    }

    if (anyKeycomboIsDown) {
      const { getMetadata } = api,
            metadata = getMetadata()

      metadata.pressed = toPressed(statusesByKeycombo)

      if (preventsDefaultUnlessDenied) event.preventDefault()

      onUp?.(toHookApi(api))
      return
    }

    denied()
    cleanup()
    onUp?.(toHookApi(api))
  }

  return {
    keydown,
    keyup,
  }
}

function toPressed (statusesByKeycombo: { [keycombo: string]: 'down' | 'up' }) {
  const keycombos: string[] = []
  for (const keycombo in statusesByKeycombo) {
    if (statusesByKeycombo[keycombo] === 'down') {
      keycombos.push(keycombo)
    }
  }
  return keycombos
}
