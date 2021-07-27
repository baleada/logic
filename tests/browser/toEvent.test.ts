import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

const suite = withPuppeteer(
  createSuite('toEvent')
)

suite(`transforms single character combos`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          // @ts-ignore
          const event = window.Logic_extracted.toEvent(['a'], { keyDirection: 'down' }),
                { key, type } = event
          
          return { key, type }
        }),
        expected = { key: 'a', type: 'keydown' }

  assert.equal(value, expected)
})

suite(`transforms other combos`, async({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          // @ts-ignore
          const event = window.Logic_extracted.toEvent(['esc'], { keyDirection: 'down' }),
                { key, type } = event
          
          return { key, type }
        }),
        expected = { key: 'Escape', type: 'keydown' }

  assert.equal(value, expected)

})

suite(`transforms modifier combos`, async({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          // @ts-ignore
          const event = window.Logic_extracted.toEvent(['cmd'], { keyDirection: 'up' }),
                { key, type } = event
          
          return { key, type }
        }),
        expected = { key: 'Meta', type: 'keyup' }

  assert.equal(value, expected)

})

suite(`transforms click combos`, async({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          // @ts-ignore
          const event = window.Logic_extracted.toEvent(['click']),
                { clientX, clientY } = event
          
          return { clientX, clientY }
        }),
        expected = { clientX: 0, clientY: 0 }

  assert.equal(value, expected)

})

suite(`transforms custom combos`, async({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          // @ts-ignore
          const event = window.Logic_extracted.toEvent(['stub']),
                { type } = event
          
          return { type }
        }),
        expected = { type: 'stub' }

  assert.equal(value, expected)

})

suite(`transforms modified single character combos`, async({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          // @ts-ignore
          const event = window.Logic_extracted.toEvent(['shift', 'a'], { keyDirection: 'down' }),
                { key, type, shiftKey } = event
          
          return { key, type, shiftKey }
        }),
        expected = { key: 'a', type: 'keydown', shiftKey: true }

  assert.equal(value, expected)

})

suite(`transforms modified other combos`, async({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          // @ts-ignore
          const event = window.Logic_extracted.toEvent(['shift', 'esc'], { keyDirection: 'down' }),
                { key, type, shiftKey } = event
          
          return { key, type, shiftKey }
        }),
        expected = { key: 'Escape', type: 'keydown', shiftKey: true }

  assert.equal(value, expected)

})

suite(`transforms modified modifier combos`, async({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          // @ts-ignore
          const event = window.Logic_extracted.toEvent(['shift', 'cmd'], { keyDirection: 'up' }),
                { key, type, shiftKey } = event
          
          return { key, type, shiftKey }
        }),
        expected = { key: 'Meta', type: 'keyup', shiftKey: true }

  assert.equal(value, expected)
})

suite(`transforms modified click combos`, async({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          // @ts-ignore
          const event = window.Logic_extracted.toEvent(['shift', 'click']),
                { clientX, clientY, shiftKey } = event
          
          return { clientX, clientY, shiftKey }
        }),
        expected = { clientX: 0, clientY: 0, shiftKey: true }

  assert.equal(value, expected)
})

suite.run()
