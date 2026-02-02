import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'
import { withPlaywrightOptions } from '../fixtures/withPlaywrightOptions'

const suite = withPlaywright(
  createSuite('toInterpolated'),
  withPlaywrightOptions
)

suite('interpolates numbers', async ({ playwright: { page } }) => {
  const value = await page.evaluate(() => window.Logic.toInterpolated({ previous: 0, next: 100, progress: .42 })),
        expected = 42

  assert.is(value, expected)
})

suite('interpolates strings as colors', async ({ playwright: { page } }) => {
  const value = await page.evaluate(() => window.Logic.toInterpolated({ previous: 'white', next: '#000', progress: .5 }, { color: { method: 'oklch' } })),
        expected = /oklch\([\d. ]+(none)?\)/

  assert.match(value, expected, value)
})

suite('interpolates growing arrays', async ({ playwright: { page } }) => {
  const value = await page.evaluate(() => window.Logic.toInterpolated({ previous: Array(0).fill(0).map((_, i) => i), next: Array(100).fill(0).map((_, i) => i), progress: .42 })),
        expected = Array(42).fill(0).map((_, i) => i)

  assert.equal(value, expected)
})

suite('interpolates shrinking arrays', async ({ playwright: { page } }) => {
  const value = await page.evaluate(() => window.Logic.toInterpolated({ previous: Array(100).fill(0).map((_, i) => i), next: Array(0).fill(0).map((_, i) => i), progress: .42 })),
        expected = Array(100 - 42).fill(0).map((_, i) => i)

  assert.equal(value, expected)
})

suite.run()
