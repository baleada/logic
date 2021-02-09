import slugify from '@sindresorhus/slugify'

export default function string (state) {
  return new NormalizeableString(state)
}

class NormalizeableString extends String {
  normalize () {
    return '' + this
  }

  slug (...args) {
    return string(slugify(this.normalize(), ...args))
  }
  
  clip (clipTextOrClipRE) {
    const clipped = this.replace(clipTextOrClipRE, '')
    return string(clipped)
  }
}

