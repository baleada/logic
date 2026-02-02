import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'
import { withPlaywrightOptions } from '../fixtures/withPlaywrightOptions'

const suite = withPlaywright(
  createSuite('Broadcastable'),
  withPlaywrightOptions
)

suite('stores the state', async ({ playwright: { page } }) => {
  const value = await page.evaluate(() => {
          const instance = new window.Logic.Broadcastable('Baleada: a toolkit for building web apps')
          return instance.state
        }),
        expected = 'Baleada: a toolkit for building web apps'

  assert.is(value, expected)
})

suite('assignment sets the state', async ({ playwright: { page } }) => {
  const value = await page.evaluate(() => {
          const instance = new window.Logic.Broadcastable('Baleada: a toolkit for building web apps')
          instance.state = 'Baleada: a toolkit'
          return instance.state
        }),
        expected = 'Baleada: a toolkit'

  assert.is(value, expected)
})

suite('setState sets the state', async ({ playwright: { page } }) => {
  const value = await page.evaluate(() => {
          const instance = new window.Logic.Broadcastable('Baleada: a toolkit for building web apps')
          instance.setState('Baleada: a toolkit')
          return instance.state
        }),
        expected = 'Baleada: a toolkit'

  assert.is(value, expected)
})

suite('status is "ready" after construction', async ({ playwright: { page } }) => {
  const value = await page.evaluate(() => {
          const instance = new window.Logic.Broadcastable('Baleada: a toolkit for building web apps')
          return instance.status
        }),
        expected = 'ready'

  assert.is(value, expected)
})

suite(`channel is BroadcastChannel`, async ({ playwright: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new window.Logic.Broadcastable('Baleada: a toolkit for building web apps')
          return instance.channel instanceof BroadcastChannel
        }),
        expected = true

  assert.is(value, expected)
})

suite(`broadcast(...) broadcasts state`, async ({ playwright: { page, reloadNext } }) => {
  const page2: typeof page = await page.context().newPage()
  await page2.goto('http://localhost:5173')
  await page2.evaluate(() => {
    const instance = new BroadcastChannel('baleada')
    instance.addEventListener('message', event => {
      window.testState = event.data
    })
  })

  await page.evaluate(async () => {
    const instance = new window.Logic.Broadcastable('Baleada: a toolkit for building web apps')
    instance.broadcast()
  })

  const value = await page2.evaluate(() => window.testState),
        expected = 'Baleada: a toolkit for building web apps'

  assert.is(value, expected)

  reloadNext()
})

suite(`status is 'broadcasted' after successful broadcast`, async ({ playwright: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new window.Logic.Broadcastable('Baleada: a toolkit for building web apps')
          instance.broadcast()
          return instance.status
        }),
        expected = 'broadcasted'

  assert.is(value, expected)
})

suite(`broadcast(...) stores the error`, async ({ playwright: { page, reloadNext } }) => {
  const value = await page.evaluate(async () => {
          const instance = new window.Logic.Broadcastable(() => 'Baleada: a toolkit for building web apps')
          instance.broadcast()
          return !!instance.error.message
        }),
        expected = true

  assert.is(value, expected)

  reloadNext()
})

suite(`status is 'errored' after unsuccessful broadcast`, async ({ playwright: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new window.Logic.Broadcastable(() => 'Baleada: a toolkit for building web apps')
          instance.broadcast()
          return instance.status
        }),
        expected = 'errored'

  assert.is(value, expected)
})

suite(`stop(...) closes the channel`, async ({ playwright: { page, reloadNext } }) => {
  const page2: typeof page = await page.context().newPage()
  await page2.goto('http://localhost:5173')
  await page2.evaluate(() => {
    const instance = new BroadcastChannel('baleada')
    instance.addEventListener('message', event => {
      window.testState = event.data
    })
  })

  await page.evaluate(async () => {
    const instance = new window.Logic.Broadcastable('Baleada: a toolkit for building web apps')
    instance.stop()
    instance.broadcast()
  })

  const value = await page2.evaluate(() => !!window.testState),
        expected = false

  assert.is(value, expected)

  reloadNext()
})

suite(`status is 'stopped' after successful stop`, async ({ playwright: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new window.Logic.Broadcastable('Baleada: a toolkit for building web apps')
          instance.stop()
          return instance.status
        }),
        expected = 'stopped'

  assert.is(value, expected)
})

suite.run()
