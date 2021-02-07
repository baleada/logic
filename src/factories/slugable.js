/*
 * slugable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */
 
import slugify from '@sindresorhus/slugify'

export default function slugable (string) {
  const slug = (...args) => {
    return slugable(slugify(string, ...args))
  }

  return { slug, value: string }
}

