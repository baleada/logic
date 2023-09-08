import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

const suite = withPuppeteer(
  createSuite('Shareable')
)

suite('stores the shareData', async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          const instance = new window.Logic.Shareable({ url: 'https://baleada.dev' })
          return instance.shareData
        }),
        expected = { url: 'https://baleada.dev' }
  
  assert.equal(value, expected)
})

suite('assignment sets the shareData', async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          const instance = new window.Logic.Shareable({ url: 'https://baleada.dev' })
          instance.shareData = { url: 'https://alexvipond.dev' }
          return instance.shareData
        }),
        expected = { url: 'https://alexvipond.dev' }

  assert.equal(value, expected)
})

suite('setShareData sets the shareData', async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          const instance = new window.Logic.Shareable({ url: 'https://baleada.dev' })
          instance.setShareData({ url: 'https://alexvipond.dev' })
          return instance.shareData
        }),
        expected = { url: 'https://alexvipond.dev' }

  assert.equal(value, expected)
})

suite('status is "ready" after construction', async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          const instance = new window.Logic.Shareable({ url: 'https://baleada.dev' })
          return instance.status
        }),
        expected = 'ready'

  assert.is(value, expected)
})

/* INFORMAL */

// share
// error handling

suite.run()
