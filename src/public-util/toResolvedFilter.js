import toResolvedMap from './toResolvedMap.js'

export default async function toResolvedFilter ({ array, condition }) {
  const filterResults = await toResolvedMap(() => array.map(async item => await condition(item)))
  return array.filter((_, index) => filterResults[index])
}
