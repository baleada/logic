import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'
import { withPlaywrightOptions } from '../fixtures/withPlaywrightOptions'

const suite = withPlaywright(
  createSuite('string'),
  withPlaywrightOptions
)

suite('createSanitize(...) sanitizes html strings', async ({ playwright: { page } }) => {
  const value = await page.evaluate(async () => {
          return window.Logic.createSanitize()('<h1>Baleada: a toolkit for building web apps</h1><iframe src="" />')
        }),
        expected = '<h1>Baleada: a toolkit for building web apps</h1>'

  assert.is(value, expected)
})

suite.run()
