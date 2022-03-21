import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import { WithGlobals } from '../fixtures/types'

type Context = {
  string: string,
}

const suite = withPuppeteer(
  createSuite<Context>('Copyable'),
  {
    launch: ({ executablePath: { macOS } }) => ({ headless: false, executablePath: macOS })
  }
)

suite.before(context => {
  context.string = 'Baleada: a toolkit for building web apps'
})

suite.before.each(async ({ puppeteer: { page } }) => {
  await page.waitForSelector('body')
  await page.click('body')
})

suite('stores the string', async ({ puppeteer: { page }, string }) => {
  const value = await page.evaluate(string => {
          const instance = new (window as unknown as WithGlobals).Logic.Copyable(string)
          return instance.string
        }, string),
        expected = string

  assert.is(value, expected)
})

suite('assignment sets the string', async ({ puppeteer: { page }, string }) => {
  const value = await page.evaluate(string => {
          const instance = new (window as unknown as WithGlobals).Logic.Copyable(string)
          instance.string = 'Baleada'
          return instance.string
        }, string),
        expected = 'Baleada'

  assert.is(value, expected)
})

suite('setString sets the string', async ({ puppeteer: { page }, string }) => {
  const value = await page.evaluate(string => {
          const instance = new (window as unknown as WithGlobals).Logic.Copyable(string)
          instance.setString('Baleada')
          return instance.string
        }, string),
        expected = 'Baleada'

  assert.is(value, expected)
})

suite('status is "ready" after construction', async ({ puppeteer: { page }, string }) => {
  const value = await page.evaluate(string => {
          const instance = new (window as unknown as WithGlobals).Logic.Copyable(string)
          return instance.status
        }, string),
        expected = 'ready'

  assert.is(value, expected)
})

suite(`status is 'copying' immediately after copy(...)`, async ({ puppeteer: { page }, string }) => {
  const value = await page.evaluate(async string => {
          const instance = new (window as unknown as WithGlobals).Logic.Copyable(string)
          instance.copy()
          return instance.status
        }, string),
        expected = 'copying'
  
  assert.is(value, expected)
})

suite(`status is 'copied' after successful copy(...)`, async ({ puppeteer: { page }, string }) => {
  const value = await page.evaluate(async string => {
          const instance = new (window as unknown as WithGlobals).Logic.Copyable(string)
          await instance.copy()
          return instance.status
        }, string),
        expected = 'copied'
  
  assert.is(value, expected)
})

suite(`isClipboardText is true after successful copy(...)`, async ({ puppeteer: { page }, string }) => {
  const value = await page.evaluate(async string => {
          const instance = new (window as unknown as WithGlobals).Logic.Copyable(string)
          await instance.copy()
          return await instance.isClipboardText
        }, string),
        expected = true
  
  assert.is(value, expected)
})

// TODO: Test global copy and cut tracking

suite.run()
