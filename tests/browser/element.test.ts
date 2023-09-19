import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

const suite = withPuppeteer(
  createSuite('element (browser)')
)

suite('createFocusable(\'first\') finds first focusable', async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/createFocusable')
  await page.waitForSelector('div')

  const value = await page.evaluate(async () => {
          return window.Logic.createFocusable('first')(window.testState.element1.value)?.id
        }),
        expected = 'first'

  assert.is(value, expected)
})

suite('createFocusable(\'last\') finds last focusable', async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          return window.Logic.createFocusable('last')(window.testState.element1.value)?.id
        }),
        expected = 'last'

  assert.is(value, expected)
})

suite('createFocusable(...) returns undefined when no focusable', async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          return window.Logic.createFocusable('first')(window.testState.element2.value)?.id
        }),
        expected = undefined

  assert.is(value, expected)
})

suite('createComputedStyle(...) returns computed style', async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/')
  await page.waitForSelector('div')

  const value = await page.evaluate(async () => {
          document.body.style.height = '100px'
          return window.Logic.createComputedStyle()(document.body).height
        }),
        expected = '100px'
        
  assert.is(value, expected)
})

suite('createComputedStyle(...) returns computed style for pseudo element', async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          // add before rule for document.body
          const style = document.createElement('style')
          style.innerHTML = `
            body::before {
              content: '';
              display: block;
              height: 100px;
            }
          `
          document.head.appendChild(style)
          return window.Logic.createComputedStyle('::before')(document.body).height
        }),
        expected = '100px'
        
  assert.is(value, expected)
})


suite.run()
