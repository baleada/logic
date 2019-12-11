import { mouseEquivalents } from '../constants'

export default function(touchType) {
  return mouseEquivalents[touchType]
}
