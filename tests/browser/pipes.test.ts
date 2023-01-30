import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import {
  createToFocusable,
} from '../../src/pipes'

const suite = createSuite('pipes (browser)')

// ELEMENT
suite(`createToFocusable('first') finds first focusable`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          
        }),
        expected = ''

  assert.is(true, false)
})


// EVENT
// createMatchesKeycombo -> eventMatchesKeycombo.test.ts
// createMatchesMousecombo -> eventMatchesMousecombo.test.ts
// createMatchesPointercombo -> eventMatchesPointercombo.test.ts

suite.run()
