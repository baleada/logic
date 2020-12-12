import isObject from './isObject.js'

export default function domIsAvailable () {
  try {
    return isObject(window)
  } catch (error) {
    return false
  }
}
