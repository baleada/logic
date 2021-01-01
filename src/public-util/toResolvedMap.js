import Resolveable from '../classes/Resolveable.js'

export default async function toResolvedMap ({ array, map }) {
  const resolveable = new Resolveable(() => array.map(async item => map(item))))
  return (await resolveable.resolve()).response
}
