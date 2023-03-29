import { createKeychord } from './createKeychord'
import type {
  KeychordTypes,
  KeychordMetadata,
  KeychordOptions,
  KeychordHook,
  KeychordHookApi
} from './createKeychord'
import { RecognizeableOptions } from '@baleada/logic'

export type KonamiTypes = KeychordTypes
export type KonamiMetadata = KeychordMetadata
export type KonamiOptions = KeychordOptions
export type KonamiHook = KeychordHook
export type KonamiHookApi = KeychordHookApi

export function createKonami (options: KonamiOptions = {}): RecognizeableOptions<KonamiTypes, KonamiMetadata>['effects'] {
  return createKeychord('up up down down left right left right b a enter', options)
}
