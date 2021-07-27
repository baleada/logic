import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import { WithLogic } from '../fixtures/types'

type Context = {
  html: string,
}

const suite = withPuppeteer(
  createSuite<Context>('Sanitizeable')
)

suite.before(context => {
  context.html = '<h1>Baleada: a toolkit for building web apps</h1><iframe src="" />'
})

suite('stores the html', async ({ puppeteer: { page }, html }) => {
  const value = await page.evaluate(html => {
          const instance = new (window as unknown as WithLogic).Logic.Sanitizeable(html)
          return instance.html
        }, html),
        expected = '<h1>Baleada: a toolkit for building web apps</h1><iframe src="" />'

  assert.is(value, expected)
})

suite('assignment sets the html', async ({ puppeteer: { page }, html }) => {
  const value = await page.evaluate(html => {
          const instance = new (window as unknown as WithLogic).Logic.Sanitizeable(html)
          instance.html = '<h1>Baleada</h1>'
          return instance.html
        }, html),
        expected = '<h1>Baleada</h1>'

  assert.is(value, expected)
})

suite('setHtml sets the html', async ({ puppeteer: { page }, html }) => {
  const value = await page.evaluate(html => {
          const instance = new (window as unknown as WithLogic).Logic.Sanitizeable(html)
          instance.setHtml('<h1>Baleada</h1>')
          return instance.html
        }, html),
        expected = '<h1>Baleada</h1>'

  assert.is(value, expected)
})

suite('status is "ready" after construction', async ({ puppeteer: { page }, html }) => {
  const value = await page.evaluate(html => {
          const instance = new (window as unknown as WithLogic).Logic.Sanitizeable(html)
          return instance.status
        }, html),
        expected = 'ready'

  assert.is(value, expected)
})

suite(`sanitize(...) sanitizes html`, async ({ puppeteer: { page }, html }) => {
  const value = await page.evaluate(async html => {
          const instance = new (window as unknown as WithLogic).Logic.Sanitizeable(html)
          instance.sanitize()
          return instance.html
        }, html),
        expected = '<h1>Baleada: a toolkit for building web apps</h1>'
  
  assert.is(value, expected)
})

suite(`status is 'sanitized' after successful sanitize(...)`, async ({ puppeteer: { page }, html }) => {
  const value = await page.evaluate(async html => {
          const instance = new (window as unknown as WithLogic).Logic.Sanitizeable(html)
          instance.sanitize()
          return instance.status
        }, html),
        expected = 'sanitized'
  
  assert.is(value, expected)
})

suite(`dompurify is available when DOM is available`, async ({ puppeteer: { page }, html }) => {
  const value = await page.evaluate(async html => {
          const instance = new (window as unknown as WithLogic).Logic.Sanitizeable(html)
          return instance.dompurify.isSupported
        }, html),
        expected = true

  assert.is(value, expected)
})

suite.run()
