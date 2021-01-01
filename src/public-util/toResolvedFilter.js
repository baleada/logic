import toResolvedMap from './toResolvedMap.js'

export default async function toResolvedFilter ({ array, condition }) {
  const filterResults = await toResolvedMap({ array, map: condition })
  return array.filter((_, index) => filterResults[index])
}
