import { Listenable } from '../classes/Listenable'
import { createKeychord } from './createKeychord'
import type {
  KeychordType,
  KeychordMetadata,
  KeychordOptions,
  KeychordHook,
  KeychordHookApi,
} from './createKeychord'

export type KonamiType = KeychordType
export type KonamiMetadata = KeychordMetadata
export type KonamiOptions = KeychordOptions
export type KonamiHook = KeychordHook
export type KonamiHookApi = KeychordHookApi

export function createKonami (options: KonamiOptions = {}) {
  return createKeychord('up up down down left right left right b a enter', options)
}

export class Konami extends Listenable<KonamiType, KonamiMetadata> {
  constructor (options?: KonamiOptions) {
    super(
      'recognizeable' as KonamiType,
      {
        recognizeable: {
          effects: createKonami(options),
        },
      }
    )
  }

  get metadata () {
    return this.recognizeable.metadata
  }
}
