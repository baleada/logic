import Resolveable from '../classes/Resolveable.js'

export default async function toResolvedMap (getMappedPromises) {
  const resolveable = new Resolveable(getMappedPromises)
  return (await resolveable.resolve()).response
}
