import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

const suite = withPuppeteer(
  createSuite('pipes (browser)')
)

// ELEMENT
suite(` createToFocusable('first') finds first focusable`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/createToFocusable')
  await page.waitForSelector(`div`)

  const value = await page.evaluate(async () => {
          return window.Logic_pipes.createToFocusable('first')(window.testState.element1.value)?.id
        }),
        expected = 'first'

  assert.is(value, expected)
})

suite(` createToFocusable('last') finds last focusable`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          return window.Logic_pipes.createToFocusable('last')(window.testState.element1.value)?.id
        }),
        expected = 'last'

  assert.is(value, expected)
})

suite(` createToFocusable(...) returns undefined when no focusable`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          return window.Logic_pipes.createToFocusable('first')(window.testState.element2.value)?.id
        }),
        expected = undefined

  assert.is(value, expected)
})


// EVENT
// createMatchesKeycombo -> eventMatchesKeycombo.test.ts
// createMatchesMousecombo -> eventMatchesMousecombo.test.ts
// createMatchesPointercombo -> eventMatchesPointercombo.test.ts

suite.run()
