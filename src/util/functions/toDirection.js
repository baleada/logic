import { directions } from '../dictionaries'

export default function(angle, unit = 'degrees') {
  return Object.keys(directions).find(direction => directions[direction][unit](angle))
}
