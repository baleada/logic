import publics from '../data/publics.json'
import is from '../utils/is'

export default function toProvisions(instance) {
  return publics[instance]
    .reduce(
      (provisions, key) => ({
        ...provisions,
        [key]: is.function(instance[key]) ? instance[key].bind(instance) : instance[key]
      }),
      {}
    )
}
