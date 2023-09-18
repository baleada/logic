export type MixColorTransform<Transformed> = (mixColor: MixColor) => Transformed

export type ColorInterpolationMethod = RectangularColorSpace | PolarColorSpace | `${PolarColorSpace} ${HueInterpolationMethod}`
type RectangularColorSpace = 'srgb' | 'srgb-linear' | 'lab' | 'oklab' | 'xyz' | 'xyz-d50' | 'xyz-d65'
type PolarColorSpace = 'hsl' | 'hwb' | 'lch' | 'oklch'
type HueInterpolationMethod = 'shorter' | 'longer' | 'increasing' | 'decreasing'

export type CreateMixOptions = {
  method?: ColorInterpolationMethod,
  tag?: string,
  getParent?: () => HTMLElement,
}

export const defaultCreateMixOptions: CreateMixOptions = {
  method: 'oklch',
  tag: 'div',
  getParent: () => document.body,
}

export type MixColor = `${string} ${number}%` | string

/**
 * [Docs](https://baleada.dev/docs/logic/pipes/mix)
 */
export function createMix (color2: MixColor, options: CreateMixOptions = {}): MixColorTransform<string> {
  const { method, tag, getParent } = { ...defaultCreateMixOptions, ...options }
  
  return color1 => {
    const element = document.createElement(tag),
          parent = getParent()

    element.style.color = `color-mix(in ${method}, ${color1}, ${color2})`

    parent.appendChild(element)

    const mixed = getComputedStyle(element).color

    parent.removeChild(element)    

    return mixed
  }
}
