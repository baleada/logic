/*
 * clipable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */
 
export default function clipable (string) {
  const clip = clipTextOrClipRE => {
    const clipped = string.replace(clipTextOrClipRE, '')
    return clipable(clipped)
  }

  return { clip, value: string }
}

