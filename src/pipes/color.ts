export type ColorInterpolationMethod = RectangularColorSpace | PolarColorSpace | `${PolarColorSpace} ${HueInterpolationMethod}`
type RectangularColorSpace = 'srgb' | 'srgb-linear' | 'lab' | 'oklab' | 'xyz' | 'xyz-d50' | 'xyz-d65'
type PolarColorSpace = 'hsl' | 'hwb' | 'lch' | 'oklch'
type HueInterpolationMethod = 'shorter' | 'longer' | 'increasing' | 'decreasing'

export type CreateMixOptions = {
  tag?: string,
  getParent?: () => HTMLElement,
}

export const defaultCreateMixOptions: CreateMixOptions = {
  tag: 'div',
  getParent: () => document.body,
}

export type MixColor = string | `${string} ${number}%`

export function createMix(method: ColorInterpolationMethod, options: CreateMixOptions = {}) {
  const { tag, getParent } = { ...defaultCreateMixOptions, ...options }
  
  return (color1: MixColor, color2: MixColor) => {
    const element = document.createElement(tag),
          parent = getParent()

    element.style.color = `color-mix(in ${method}, ${color1}, ${color2})`

    parent.appendChild(element)

    const mixed = getComputedStyle(element).color

    parent.removeChild(element)    

    return mixed
  }
}
