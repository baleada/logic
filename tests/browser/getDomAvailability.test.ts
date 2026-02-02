import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'
import { withPlaywrightOptions } from '../fixtures/withPlaywrightOptions'
import { getDomAvailability } from '../../src/extracted'

const suite = withPlaywright(
  createSuite('getDomAvailability'),
  withPlaywrightOptions
)

suite(`detects when DOM is not available`, async ({ playwright: { page } }) => {
  const value = getDomAvailability(),
        expected = 'unavailable'

  assert.is(value, expected)
})

suite(`detects when DOM is available`, async ({ playwright: { page } }) => {
  const value = await page.evaluate(async () => {
          return window.Logic.getDomAvailability()
        }),
        expected = 'available'

  assert.is(value, expected)
})

suite.run()
