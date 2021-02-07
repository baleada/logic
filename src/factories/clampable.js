/*
 * clampable.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */
 
 export default function clampable (number) {
  const object = new Number(number)

  object.clamp = function ({ min, max }) {
    const maxed = Math.max(0 + object, min),
          clamped = Math.min(maxed, max)
          
    return clampable(clamped)
  }

  return object
}

