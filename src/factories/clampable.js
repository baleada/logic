/*
 * clampable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */
 
 export default function clampable (number) {
  const clamp = ({ min, max }) => {
    const maxed = Math.max(0 + number, min),
          clamped = Math.min(maxed, max)
          
    return clampable(clamped)
  }

  return { clamp, value: number }
}
