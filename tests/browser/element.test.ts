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

suite('createFocusable(\'next\') finds next focusable when next focusable is descendant', async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          return window.Logic.createFocusable('next')(window.testState.element3.value)?.id
        }),
        expected = 'next-descendant'

  assert.is(value, expected)
})

suite('createFocusable(\'next\') finds next focusable when next focusable is distant ancestor\'s sibling', async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          return window.Logic.createFocusable('next')(window.testState.element4.value)?.id
        }),
        expected = 'next-distant-sibling'

  assert.is(value, expected)
})

suite('createFocusable(\'next\') finds next focusable when next element sibling has no focusable, but sibling after does', async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          return window.Logic.createFocusable('next')(window.testState.sibling1.value) === window.testState.sibling3.value
        })

  assert.ok(value)
})

suite('createFocusable(\'next\') returns undefined if no next focusable', async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          return window.Logic.createFocusable('next')(window.testState.sibling3.value)?.id
        }),
        expected = undefined

  assert.is(value, expected)
})

suite('createFocusable(\'previous\') finds previous focusable when previous focusable is distant ancestor\'s sibling', async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          return window.Logic.createFocusable('previous')(window.testState.element5.value)?.id
        }),
        expected = 'previous-distant-sibling'

  assert.is(value, expected)
})

suite('createFocusable(\'previous\') finds previous focusable when previous element sibling has no focusable, but sibling before does', async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          return window.Logic.createFocusable('previous')(window.testState.sibling3.value) === window.testState.sibling1.value
        })

  assert.ok(value)
})

suite('createFocusable(\'previous\') returns undefined if no previous focusable', async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          return window.Logic.createFocusable('previous')(window.testState.element7.value)?.id
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
