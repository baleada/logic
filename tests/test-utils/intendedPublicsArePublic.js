import publics from '../../src/data/publics.json'
import is from '../../src/utils/is'

export default function intendedPublicsArePublic(instance, libraryName) {
  return publics[libraryName].every(key => instance[key] !== undefined)
}
