import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'
import { withPlaywrightOptions } from '../fixtures/withPlaywrightOptions'
import type { ColorInterpolationMethod, MixColor } from '../../src/pipes/color'

const suite = withPlaywright(
  createSuite('color pipes'),
  withPlaywrightOptions
)

suite('createMix() works', async ({ playwright: { page } }) => {
  for (
    const [method, color1, color2, expected]
    of [
      ['lch', 'plum', 'pink', /lch\([\d. ]+(none)?\)/],
      ['lch', 'plum 40%', 'pink', /lch\([\d. ]+(none)?\)/],
      ['srgb', '#34c9eb 20%', 'white', /color\(srgb [\d. ]+\)/],
      ['hsl longer hue', 'hsl(120 100% 50%) 20%', 'white', /color\(srgb [\d. ]+\)/],
    ] as [ColorInterpolationMethod, MixColor, MixColor, RegExp][]
  ) {
    const value = await page.evaluate(({ method, color1, color2 }) => {
            return window.Logic.createMix(color2, { method })(color1)
          }, { method, color1, color2 })

    assert.match(value, expected)
  }
})

suite.run()
