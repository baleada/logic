import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'
import { withPlaywrightOptions } from '../fixtures/withPlaywrightOptions'

type Context = {
  string: string,
}

const suite = withPlaywright(
  createSuite<Context>('Copyable'),
  { ...withPlaywrightOptions, launch: { ...withPlaywrightOptions.launch, headless: false } }
)

suite.before(context => {
  context.string = 'Baleada: a toolkit for building web apps'
})

suite.before.each(async ({ playwright: { page } }) => {
  await page.waitForSelector('body', { state: 'attached' })
  await page.click('body')
})

suite('stores the string', async ({ playwright: { page }, string }) => {
  const value = await page.evaluate(string => {
          const instance = new window.Logic.Copyable(string)
          return instance.string
        }, string),
        expected = string

  assert.is(value, expected)
})

suite('assignment sets the string', async ({ playwright: { page }, string }) => {
  const value = await page.evaluate(string => {
          const instance = new window.Logic.Copyable(string)
          instance.string = 'Baleada'
          return instance.string
        }, string),
        expected = 'Baleada'

  assert.is(value, expected)
})

suite('setString sets the string', async ({ playwright: { page }, string }) => {
  const value = await page.evaluate(string => {
          const instance = new window.Logic.Copyable(string)
          instance.setString('Baleada')
          return instance.string
        }, string),
        expected = 'Baleada'

  assert.is(value, expected)
})

suite('status is "ready" after construction', async ({ playwright: { page }, string }) => {
  const value = await page.evaluate(string => {
          const instance = new window.Logic.Copyable(string)
          return instance.status
        }, string),
        expected = 'ready'

  assert.is(value, expected)
})

suite(`status is 'copying' immediately after copy(...)`, async ({ playwright: { page }, string }) => {
  const value = await page.evaluate(async string => {
          const instance = new window.Logic.Copyable(string)
          instance.copy()
          return instance.status
        }, string),
        expected = 'copying'

  assert.is(value, expected)
})

suite(`status is 'copied' after successful copy(...)`, async ({ playwright: { page }, string }) => {
  const value = await page.evaluate(async string => {
          const instance = new window.Logic.Copyable(string)
          await instance.copy()
          return instance.status
        }, string),
        expected = 'copied'

  assert.is(value, expected)
})

suite(`isClipboardText is true after successful copy(...)`, async ({ playwright: { page }, string }) => {
  const value = await page.evaluate(async string => {
          const instance = new window.Logic.Copyable(string)
          await instance.copy()
          return await instance.isClipboardText
        }, string),
        expected = true

  assert.is(value, expected)
})

// TODO: Test global copy and cut tracking

suite.run()
