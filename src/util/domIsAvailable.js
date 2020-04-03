import is from './is'

export default function domIsAvailable () {
  try {
    return is.object(window)
  } catch (error) {
    return false
  }
}