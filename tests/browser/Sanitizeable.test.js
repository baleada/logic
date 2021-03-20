import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

const suite = withPuppeteer(
  createSuite('Sanitizeable (browser)')
)

suite.before(context => (context.html = '<h1>Baleada: a toolkit for building web apps</h1><iframe src="" />'))

suite.before.each(async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000')
  await page.waitForSelector('body')
  await page.click('body')
})

suite(`sanitize(...) sanitizes html`, async ({ puppeteer: { page }, html }) => {
  const value = await page.evaluate(async html => {
          const instance = new window.Logic.Sanitizeable(html)
          instance.sanitize()
          return instance.html
        }, html),
        expected = '<h1>Baleada: a toolkit for building web apps</h1>'
  
  assert.is(value, expected)
})

suite(`status is 'sanitized' after successful sanitize(...)`, async ({ puppeteer: { page }, html }) => {
  const value = await page.evaluate(async html => {
          const instance = new window.Logic.Sanitizeable(html)
          instance.sanitize()
          return instance.status
        }, html),
        expected = 'sanitized'
  
  assert.is(value, expected)
})

suite(`dompurify is available when DOM is available`, async ({ puppeteer: { page }, html }) => {
  const value = await page.evaluate(async html => {
          const instance = new window.Logic.Sanitizeable(html)
          return instance.dompurify.isSupported
        }, html),
        expected = true

  assert.is(value, expected)
})

suite.run()
