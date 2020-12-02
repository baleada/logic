import get from './get.js'
import set from './set.js'

export default function push ({ object, path, value }) {  
  const array = get({ object, path })
  set({ object, path, value: [...array, value] })
}
