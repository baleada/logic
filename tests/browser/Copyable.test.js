import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

const suite = withPuppeteer(
  createSuite('Copyable (browser)'),
  {
    launch: ({ executablePath: { macOS } }) => ({ headless: false, executablePath: macOS })
  }
)

suite.before(context => (context.string = 'Baleada: a toolkit for building web apps'))

suite.before.each(async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000')
  await page.waitForSelector('body')
  await page.click('body')
})

suite(`status is 'copying' immediately after copy(...)`, async ({ puppeteer: { page }, string }) => {
  const value = await page.evaluate(async string => {
          const instance = new window.Logic.Copyable(string)
          instance.copy()
          return instance.status
        }, string),
        expected = 'copying'
  
  assert.is(value, expected)
})

suite(`status is 'copied' after successful copy(...)`, async ({ puppeteer: { page }, string }) => {
  const value = await page.evaluate(async string => {
          const instance = new window.Logic.Copyable(string)
          await instance.copy()
          return instance.status
        }, string),
        expected = 'copied'
  
  assert.is(value, expected)
})

suite(`copied is string after successful copy(...)`, async ({ puppeteer: { page }, string }) => {
  const value = await page.evaluate(async string => {
          const instance = new window.Logic.Copyable(string)
          await instance.copy()
          return (await instance.copied).response
        }, string),
        expected = string
  
  assert.is(value, expected)
})

suite.run()