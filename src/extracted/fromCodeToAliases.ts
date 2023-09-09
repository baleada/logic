import { fromKeyboardEventDescriptorToAliases } from './fromKeyboardEventDescriptorToAliases'
import type { KeyStatusCode } from './key-statuses'

export function fromCodeToAliases (code: KeyStatusCode) {
  return fromKeyboardEventDescriptorToAliases({ code })
}
