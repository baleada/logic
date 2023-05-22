import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import { getDomAvailability } from '../../src/extracted'

const suite = withPuppeteer(
  createSuite('getDomAvailability')
)

suite(`detects when DOM is not available`, async ({ puppeteer: { page } }) => {
  const value = getDomAvailability(),
        expected = 'unavailable'

  assert.is(value, expected)
})

suite(`detects when DOM is available`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          return window.Logic.getDomAvailability()
        }),
        expected = 'available'

  assert.is(value, expected)
})

suite.run()
