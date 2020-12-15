import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

const suite = withPuppeteer(
  createSuite('Fullscreenable'),
  {
    launch: ({ executablePath: { macOS } }) => ({ headless: false, executablePath: macOS })
  }
)

suite.before.each(async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000')
})

suite(`element gets the element`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new window.Logic.Fullscreenable(() => document.body)
          return document.body.isSameNode(instance.element)
        }),
        expected = true
    
  assert.is(value, expected)
})

suite(`status is 'fullscreened' after successful fullscreen(...)`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new window.Logic.Fullscreenable(() => document.body)
          await instance.fullscreen()
          return instance.status
        }),
        expected = 'fullscreened'
    
  assert.is(value, expected)
})

suite(`status is 'exited' after successful exit(...)`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new window.Logic.Fullscreenable(() => document.body)
          await instance.fullscreen()
          await instance.exit()
          return instance.status
        }),
        expected = 'exited'
    
  assert.is(value, expected)
})

suite(`enter(...) is an alias for fullscreen(...)`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new window.Logic.Fullscreenable(() => document.body)
          await instance.enter()
          return instance.status
        }),
        expected = 'fullscreened'
    
  assert.is(value, expected)
})

suite(`status is 'errored' after unsuccessful fullscreen(...)`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new window.Logic.Fullscreenable(() => ({}))
          await instance.fullscreen()
          return instance.status
        }),
        expected = 'errored'
    
  assert.is(value, expected)
})

suite(`stores the error after unsuccessful fullscreen(...)`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new window.Logic.Fullscreenable(() => ({}))
          await instance.fullscreen()
          return instance.error.name
        }),
        expected = 'TypeError'
    
  assert.is(value, expected)
})

suite(`status is 'errored' after unsuccessful exit(...)`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new window.Logic.Fullscreenable(() => document.body)
          await instance.fullscreen()
          document.exitFullscreen = ''
          await instance.exit()
          return instance.status
        }),
        expected = 'errored'
    
  assert.is(value, expected)
})

suite(`stores the error after unsuccessful exit(...)`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new window.Logic.Fullscreenable(() => document.body)
          await instance.fullscreen()
          document.exitFullscreen = ''
          await instance.exit()
          return instance.error.name
        }),
        expected = 'TypeError'
    
  assert.is(value, expected)
})

suite.run()
