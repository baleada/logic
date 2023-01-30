import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

const suite = withPuppeteer(
  createSuite('Shareable')
)

suite('stores the state', async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          const instance = new window.Logic.Shareable({ url: 'https://baleada.dev '})
          return instance.state
        }),
        expected = { url: 'https://baleada.dev '}
  
  assert.equal(value, expected)
})

suite('assignment sets the state', async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          const instance = new window.Logic.Shareable({ url: 'https://baleada.dev '})
          instance.state = { url: 'https://alexvipond.dev '}
          return instance.state
        }),
        expected = { url: 'https://alexvipond.dev '}

  assert.equal(value, expected)
})

suite('setState sets the state', async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          const instance = new window.Logic.Shareable({ url: 'https://baleada.dev '})
          instance.setState({ url: 'https://alexvipond.dev '})
          return instance.state
        }),
        expected = { url: 'https://alexvipond.dev '}

  assert.equal(value, expected)
})

suite('status is "ready" after construction', async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          const instance = new window.Logic.Shareable({ url: 'https://baleada.dev '})
          return instance.status
        }),
        expected = 'ready'

  assert.is(value, expected)
})

/* INFORMAL */

// share
// error handling

suite.run()
