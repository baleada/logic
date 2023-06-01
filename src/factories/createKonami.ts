import type { RecognizeableOptions } from '../classes'
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

export function createKonami (options: KonamiOptions = {}): RecognizeableOptions<KonamiType, KonamiMetadata>['effects'] {
  return createKeychord('up up down down left right left right b a enter', options)
}
