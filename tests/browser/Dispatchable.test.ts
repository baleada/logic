import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import { WithLogic } from '../fixtures/types'

const suite = withPuppeteer(
  createSuite('Dispatchable (browser)')
)

suite('stores the type', async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          const instance = new (window as unknown as WithLogic).Logic.Dispatchable('stub')
          return instance.type
        }),
        expected = 'stub'

  assert.is(value, expected)
})

suite('assignment sets the type', async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          const instance = new (window as unknown as WithLogic).Logic.Dispatchable('stub')
          instance.type = 'cmd+b'
          return instance.type
        }),
        expected = 'cmd+b'

  assert.is(value, expected)
})

suite('setType sets the type', async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          const instance = new (window as unknown as WithLogic).Logic.Dispatchable('stub')
          instance.setType('cmd+b')
          return instance.type
        }),
        expected = 'cmd+b'

  assert.is(value, expected)
})

suite('status is "ready" after construction', async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          const instance = new (window as unknown as WithLogic).Logic.Dispatchable('stub')
          return instance.status
        }),
        expected = 'ready'

  assert.is(value, expected)
})

suite(`status is 'dispatched' after successful dispatch(...)`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new (window as unknown as WithLogic).Logic.Dispatchable('stub')
          instance.dispatch()
          return instance.status
        }),
        expected = 'dispatched'

  assert.is(value, expected)
})

suite(`dispatch(...) target defaults to window`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new (window as unknown as WithLogic).Logic.Dispatchable('stub')
          window.addEventListener('stub', event => result = event.type)

          let result
          instance.dispatch()

          return result
        }),
        expected = 'stub'

  assert.is(value, expected)
})

suite(`dispatch(...) can customize target`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new (window as unknown as WithLogic).Logic.Dispatchable('stub'),
                el = document.createElement('span')

          el.addEventListener('stub', () => result = true)

          let result
          instance.dispatch({ target: el })

          return result
        }),
        expected = true

  assert.is(value, expected)
})

suite(`dispatch(...) handles keyboard events, defaulting to keydown`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new (window as unknown as WithLogic).Logic.Dispatchable('b')
          window.addEventListener('keydown', event => result = event.type)

          let result
          instance.dispatch()

          return result
        }),
        expected = 'keydown'

  assert.is(value, expected)
})

suite(`dispatch(...) can optionally use keyup`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new (window as unknown as WithLogic).Logic.Dispatchable('b')
          window.addEventListener('keyup', event => result = event.type)

          let result
          instance.dispatch({ keyDirection: 'up' })

          return result
        }),
        expected = 'keyup'

  assert.is(value, expected)
})

suite(`dispatch(...) can optionally init event`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new (window as unknown as WithLogic).Logic.Dispatchable('stub')
          window.addEventListener('stub', event => result = event.bubbles)

          let result
          instance.dispatch({ init: { bubbles: true } })

          return result
        }),
        expected = true

  assert.is(value, expected)
})

suite(`dispatch(...) updates cancelled`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new (window as unknown as WithLogic).Logic.Dispatchable('stub'),
                before = instance.cancelled

          instance.dispatch()

          return { beforeIsUndefined: before === undefined, after: instance.cancelled }
        }),
        expected = { beforeIsUndefined: true, after: false }

  assert.equal(value, expected)
})

suite.run()
