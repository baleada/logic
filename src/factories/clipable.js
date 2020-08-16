/*
 * clipable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */
 
export default function clipable (string) {
  const object = new String(string)

  object.clip = function (clipTextOrClipRE) {
    const clipped = object.replace(clipTextOrClipRE, '')
    return clipable(clipped)
  }

  return object
}

