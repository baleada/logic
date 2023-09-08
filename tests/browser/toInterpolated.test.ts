import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

const suite = withPuppeteer(
  createSuite('toInterpolated')
)

suite('interpolates numbers', async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => window.Logic.toInterpolated({ previous: 0, next: 100, progress: .42 })),
        expected = 42

  assert.is(value, expected)
})

suite('interpolates strings as colors', async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => window.Logic.toInterpolated({ previous: 'white', next: '#000', progress: .5 }, { color: { method: 'oklch' } })),
        expected = 'oklch(0.499997 0.0000248993 11.8942)'

  assert.is(value, expected)
})

suite('interpolates growing arrays', async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => window.Logic.toInterpolated({ previous: Array(0).fill(0).map((_, i) => i), next: Array(100).fill(0).map((_, i) => i), progress: .42 })),
        expected = Array(42).fill(0).map((_, i) => i)

  assert.equal(value, expected)
})

suite('interpolates shrinking arrays', async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => window.Logic.toInterpolated({ previous: Array(100).fill(0).map((_, i) => i), next: Array(0).fill(0).map((_, i) => i), progress: .42 })),
        expected = Array(100 - 42).fill(0).map((_, i) => i)

  assert.equal(value, expected)
})

suite.run()
