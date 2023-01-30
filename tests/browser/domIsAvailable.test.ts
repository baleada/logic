import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import { domIsAvailable } from '../../src/extracted'

const suite = withPuppeteer(
  createSuite('domIsAvailable')
)

suite(`detects when DOM is not available`, async ({ puppeteer: { page } }) => {
  const value = domIsAvailable(),
        expected = false

  assert.is(value, expected)
})

suite(`detects when DOM is available`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          return window.Logic_extracted.domIsAvailable()
        }),
        expected = true

  assert.is(value, expected)
})

suite.run()
