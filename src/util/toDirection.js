import { directions } from '../constants'

export default function(angle, unit = 'degrees') {
  return Object.keys(directions).find(direction => directions[direction][unit](angle))
}
