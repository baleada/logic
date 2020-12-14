import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

const suite = withPuppeteer(
  createSuite('toEvent (browser)')
)

suite.before.each(async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000')
})

suite(`transforms single character combos`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const event = window.Logic_util.toEvent({ combo: ['a'], direction: 'down' }),
                { key, type } = event
          
          return { key, type }
        }),
        expected = { key: 'a', type: 'keydown' }

  assert.equal(value, expected)
})

suite(`transforms other combos`, async({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const event = window.Logic_util.toEvent({ combo: ['esc'], direction: 'down' },),
                { key, type } = event
          
          return { key, type }
        }),
        expected = { key: 'Escape', type: 'keydown' }

  assert.equal(value, expected)

})

suite(`transforms modifier combos`, async({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const event = window.Logic_util.toEvent({ combo: ['cmd'], direction: 'up' },),
                { key, type } = event
          
          return { key, type }
        }),
        expected = { key: 'Meta', type: 'keyup' }

  assert.equal(value, expected)

})

suite(`transforms modified single character combos`, async({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const event = window.Logic_util.toEvent({ combo: ['shift', 'a'], direction: 'down' },),
                { key, type, shiftKey } = event
          
          return { key, type, shiftKey }
        }),
        expected = { key: 'a', type: 'keydown', shiftKey: true }

  assert.equal(value, expected)

})

suite(`transforms modified other combos`, async({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const event = window.Logic_util.toEvent({ combo: ['shift', 'esc'], direction: 'down' },),
                { key, type, shiftKey } = event
          
          return { key, type, shiftKey }
        }),
        expected = { key: 'Escape', type: 'keydown', shiftKey: true }

  assert.equal(value, expected)

})

suite(`transforms modified modifier combos`, async({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const event = window.Logic_util.toEvent({ combo: ['shift', 'cmd'], direction: 'up' },),
                { key, type, shiftKey } = event
          
          return { key, type, shiftKey }
        }),
        expected = { key: 'Meta', type: 'keyup', shiftKey: true }

  assert.equal(value, expected)
})

suite.run()
