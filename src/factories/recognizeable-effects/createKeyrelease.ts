import {
  filter,
  sort,
  flatMap,
  map,
  pipe,
  toArray,
  unique,
  findIndex,
} from 'lazy-collections'
import type { RecognizeableEffect, RecognizeableStatus } from '../../classes'
import {
  createSome,
  createMap,
  createReduce,
} from '../../pipes'
import {
  toHookApi,
  storeKeyboardTimeMetadata,
  narrowKeycombo,
  createKeycomboIsDown,
  toName,
} from '../../extracted'
import type {
  HookApi,
  KeyboardTimeMetadata,
  KeycomboItem,
  KeyStatus,
  KeyStatuses,
} from '../../extracted'

export type KeyreleaseType = 'keydown' | 'keyup'

export type KeyreleaseMetadata = {
  released: string,
} & KeyboardTimeMetadata

export type KeyreleaseOptions = {
  minDuration?: number,
  preventsDefaultUnlessDenied?: boolean,
  onDown?: KeyreleaseHook,
  onUp?: KeyreleaseHook,
}

export type KeyreleaseHook = (api: KeyreleaseHookApi) => any

export type KeyreleaseHookApi = HookApi<KeyreleaseType, KeyreleaseMetadata>

const defaultOptions: KeyreleaseOptions = {
  minDuration: 0,
  preventsDefaultUnlessDenied: true,
}

export function createKeyrelease (
  keycomboOrKeycombos: string | string[],
  options: KeyreleaseOptions = {}
) {
  const { minDuration, preventsDefaultUnlessDenied, onDown, onUp } = { ...defaultOptions, ...options },
        narrowedKeycombos = Array.isArray(keycomboOrKeycombos)
          ? createMap<string, KeycomboItem[]>(narrowKeycombo)(keycomboOrKeycombos)
          : [narrowKeycombo(keycomboOrKeycombos)],
        validNames = pipe<typeof narrowedKeycombos>(
          flatMap<typeof narrowedKeycombos[0], KeycomboItem['name'][]>(
            keycombo => createMap<KeycomboItem, KeycomboItem['name']>(item => item.name)(keycombo)
          ),
          unique(),
          toArray(),
        )(narrowedKeycombos) as string[],
        getDownCombos = () => (
          pipe(
            filter<KeycomboItem[]>(keycombo => createKeycomboIsDown(keycombo)(statuses)),
            sort<KeycomboItem[]>((keycomboA, keycomboB) => keycomboB.length - keycomboA.length),
            toArray()
          )(narrowedKeycombos) as typeof narrowedKeycombos
        ),
        getType = (keycombo: KeycomboItem[]) => {
          if (typeof keycomboOrKeycombos === 'string') return keycomboOrKeycombos

          const index = findIndex<KeycomboItem[]>(
            k => k === keycombo
          )(narrowedKeycombos) as number

          return keycomboOrKeycombos[index]
        },
        predicateValid = (name: string) => validNames.includes(name),
        getPressed = () => pipe(
          filter<KeycomboItem[]>(keycombo => createKeycomboIsDown(keycombo)(statuses)),
          map<KeycomboItem[], string>(getType),
          toArray(),
        )(narrowedKeycombos) as string[],
        cleanup = () => {
          window.cancelAnimationFrame(request)
        },
        statuses = createReduce<string, KeyStatuses>(
          (statuses, name) => {
            statuses[name] = 'up'
            return statuses
          },
          {}
        )(validNames)

  let request: number
  let localStatus: RecognizeableStatus

  const keydown: RecognizeableEffect<KeyreleaseType, KeyreleaseMetadata> = (event, api) => {
    const { denied, getStatus } = api,
          name = toName(event.code)          

    // SHOULD BLOCK EVENT
    if (statuses[name] === 'down') {
      onDown?.(toHookApi(api))
      return
    }

    statuses[name] = 'down'

    // ALREADY DENIED
    if (localStatus === 'denied') {
      denied()
      onDown?.(toHookApi(api))
      return
    }

    // NOT BUILDING VALID COMBO
    if (!predicateValid(name)) {
      denied()
      localStatus = getStatus()
      onDown?.(toHookApi(api))
      return
    }

    const downCombos = getDownCombos()

    // TOO MANY VALID KEYS PRESSED
    if (
      downCombos.length
      && downCombos[0].length === downCombos[1]?.length
    ) {
      denied()
      localStatus = getStatus()
      onDown?.(toHookApi(api))
      return
    }

    // BUILDING VALID KEYCOMBO
    if (preventsDefaultUnlessDenied) event.preventDefault()

    cleanup()
    storeKeyboardTimeMetadata(
      event,
      api,
      () => downCombos.length && getPressed().includes(getType(downCombos[0])),
      newRequest => request = newRequest,
    )

    onDown?.(toHookApi(api))
  }

  const keyup: RecognizeableEffect<'keyup', KeyreleaseMetadata> = (event, api) => {
    const {
            getStatus,
            getMetadata,
          } = api,
          metadata = getMetadata(),
          name = toName(event.code)          
                
    // SHOULD BLOCK EVENT
    if (['denied', 'recognized'].includes(localStatus)) {
      api[localStatus]()
      if (predicateValid(name)) statuses[name] = 'up'
      else delete statuses[name]

      if (!predicateSomeKeyIsDown(statuses)) localStatus = 'recognizing'
      onUp?.(toHookApi(api))
      return
    }

    const downCombos = getDownCombos()
    statuses[name] = 'up'

    // RELEASING PARTIAL COMBO
    if (!downCombos.length) {
      onUp?.(toHookApi(api))
      return
    }

    // RELEASING FULL COMBO
    recognize(event, api)

    const status = getStatus()

    if (status === 'recognized') {
      localStatus = status
      metadata.released = getType(downCombos[0])
    }

    if (preventsDefaultUnlessDenied) event.preventDefault()
    if (!predicateSomeKeyIsDown(statuses)) localStatus = 'recognizing'
    onUp?.(toHookApi(api))
  }

  const recognize: RecognizeableEffect<KeyreleaseType, KeyreleaseMetadata> = (event, api) => {
    const { getMetadata, recognized, denied } = api,
          metadata = getMetadata()

    if (metadata.duration < minDuration) {
      denied()
      return
    }

    if (localStatus !== 'recognized') recognized()
  }

  return {
    keydown,
    keyup,
  }
}

const predicateSomeKeyIsDown = createSome<KeycomboItem['name'], KeyStatus>((name, status) => status === 'down')
