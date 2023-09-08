import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

type Context = {
  descriptor: { name: string }
}

const suite = withPuppeteer(
  createSuite<Context>('Grantable')
)

suite.before(context => {
  context.descriptor = { name: 'geolocation' }
})

suite('stores the descriptor', async ({ puppeteer: { page }, descriptor }) => {
  const value = await page.evaluate(descriptor => {
          const instance = new window.Logic.Grantable(descriptor)
          return instance.descriptor
        }, descriptor),
        expected = { name: 'geolocation' }

  assert.equal(value, expected)
})

suite('assignment sets the descriptor', async ({ puppeteer: { page }, descriptor }) => {
  const value = await page.evaluate(descriptor => {
          const instance = new window.Logic.Grantable(descriptor)
          instance.descriptor = { name: 'clipboard-write' }
          return instance.descriptor
        }, descriptor),
        expected = { name: 'clipboard-write' }
  
  assert.equal(value, expected)
})

suite('setDescriptor sets the descriptor', async ({ puppeteer: { page }, descriptor }) => {
  const value = await page.evaluate(descriptor => {
          const instance = new window.Logic.Grantable(descriptor)
          instance.setDescriptor({ name: 'clipboard-write' })
          return instance.descriptor
        }, descriptor),
        expected = { name: 'clipboard-write' }
  
  assert.equal(value, expected)
})

suite('status is "ready" after construction', async ({ puppeteer: { page }, descriptor }) => {
  const value = await page.evaluate(descriptor => {
          const instance = new window.Logic.Grantable(descriptor)
          return instance.status
        }, descriptor),
        expected = 'ready'

  assert.is(value, expected)
})

suite(`status is 'granting' immediately after grant(...)`, async ({ puppeteer: { page }, descriptor }) => {
  const value = await page.evaluate(async descriptor => {
          const instance = new window.Logic.Grantable(descriptor)
          instance.grant()
          return instance.status
        }, descriptor),
        expected = 'granting'
  
  assert.is(value, expected)
})

suite(`status is 'granted' after successful grant(...)`, async ({ puppeteer: { page }, descriptor }) => {
  const value = await page.evaluate(async descriptor => {
          const instance = new window.Logic.Grantable(descriptor)
          await instance.grant()
          return instance.status
        }, descriptor),
        expected = 'granted'
  
  assert.is(value, expected)
})

suite(`status is 'errored' after unsuccessful grant(...)`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          // @ts-expect-error
          const instance = new window.Logic.Grantable({ name: 'stub' })
          await instance.grant()
          return instance.status
        }),
        expected = 'errored'
  
  assert.is(value, expected)
})

suite(`permission is stored after successful grant(...)`, async ({ puppeteer: { page }, descriptor }) => {
  const value = await page.evaluate(async descriptor => {
          const instance = new window.Logic.Grantable(descriptor)
          await instance.grant()
          return instance.permission.state
        }, descriptor),
        expected = 'prompt'
  
  assert.equal(value, expected)
})

suite.run()
