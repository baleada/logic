/*
 * slugable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */
 
import slugify from '@sindresorhus/slugify'

export default function slugable (string) {
  const object = new String(string)

  object.slug = function (...args) {
    return slugable(slugify(`${object}`, ...args))
  }

  return object
}

