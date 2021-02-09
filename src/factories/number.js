export default function number (state) {
  return new NormalizeableNumber(state)
}

class NormalizeableNumber extends Number {
  normalize () {
    return +this
  }

  clamp ({ min, max }) {
    const maxed = Math.max(this, min),
          clamped = Math.min(maxed, max)
          
    return number(clamped)
  }
}

