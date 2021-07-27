import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import { WithLogic } from '../fixtures/types'

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
          const instance = new (window as unknown as WithLogic).Logic.Grantable(descriptor)
          return instance.descriptor
        }, descriptor),
        expected = { name: 'geolocation' }

  assert.equal(value, expected)
})

suite('assignment sets the descriptor', async ({ puppeteer: { page }, descriptor }) => {
  const value = await page.evaluate(descriptor => {
          const instance = new (window as unknown as WithLogic).Logic.Grantable(descriptor)
          instance.descriptor = { name: 'clipboard-write' }
          return instance.descriptor
        }, descriptor),
        expected = { name: 'clipboard-write' }
  
  assert.equal(value, expected)
})

suite('setDescriptor sets the descriptor', async ({ puppeteer: { page }, descriptor }) => {
  const value = await page.evaluate(descriptor => {
          const instance = new (window as unknown as WithLogic).Logic.Grantable(descriptor)
          instance.setDescriptor({ name: 'clipboard-write' })
          return instance.descriptor
        }, descriptor),
        expected = { name: 'clipboard-write' }
  
  assert.equal(value, expected)
})

suite('status is "ready" after construction', async ({ puppeteer: { page }, descriptor }) => {
  const value = await page.evaluate(descriptor => {
          const instance = new (window as unknown as WithLogic).Logic.Grantable(descriptor)
          return instance.status
        }, descriptor),
        expected = 'ready'

  assert.is(value, expected)
})

suite(`status is 'querying' immediately after query(...)`, async ({ puppeteer: { page }, descriptor }) => {
  const value = await page.evaluate(async descriptor => {
          const instance = new (window as unknown as WithLogic).Logic.Grantable(descriptor)
          instance.query()
          return instance.status
        }, descriptor),
        expected = 'querying'
  
  assert.is(value, expected)
})

suite(`status is 'queried' after successful query(...)`, async ({ puppeteer: { page }, descriptor }) => {
  const value = await page.evaluate(async descriptor => {
          const instance = new (window as unknown as WithLogic).Logic.Grantable(descriptor)
          await instance.query()
          return instance.status
        }, descriptor),
        expected = 'queried'
  
  assert.is(value, expected)
})

suite(`status is 'errored' after unsuccessful query(...)`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new (window as unknown as WithLogic).Logic.Grantable({ name: 'stub' })
          await instance.query()
          return instance.status
        }),
        expected = 'errored'
  
  assert.is(value, expected)
})

suite(`permission is stored after successful query(...)`, async ({ puppeteer: { page }, descriptor }) => {
  const value = await page.evaluate(async descriptor => {
          const instance = new (window as unknown as WithLogic).Logic.Grantable(descriptor)
          await instance.query()
          return instance.permission.state
        }, descriptor),
        expected = 'prompt'
  
  assert.equal(value, expected)
})

suite.run()
