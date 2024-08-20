import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import type { ColorInterpolationMethod, MixColor } from '../../src/pipes/color'

const suite = withPuppeteer(
  createSuite('color pipes')
)

suite('createMix() works', async ({ puppeteer: { page } }) => {
  for (
    const [method, color1, color2, expected]
    of [
      ['lch', 'plum', 'pink', 'lch(78.5556 31.1764 346.668)'],
      ['lch', 'plum 40%', 'pink', 'lch(79.6014 29.8899 351.084)'],
      ['srgb', '#34c9eb 20%', 'white', 'color(srgb 0.840784 0.957647 0.984314)'],
      ['hsl longer hue', 'hsl(120 100% 50%) 20%', 'white', 'color(srgb 0.92 0.912 0.88)'],
    ] as [ColorInterpolationMethod, MixColor, MixColor, string][]
  ) {
    const value = await page.evaluate((method, color1, color2) => {
            return window.Logic.createMix(color2, { method })(color1)
          }, method, color1, color2)

    assert.is(value, expected)
  }
})

suite.run()
