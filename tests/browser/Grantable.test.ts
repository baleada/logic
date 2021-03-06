import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

type Context = {
  descriptor: { name: string }
}

const suite = withPuppeteer(
  createSuite<Context>('Grantable (browser)')
)

suite.before(context => {
  context.descriptor = { name: 'geolocation' }
})

suite(`status is 'querying' immediately after query(...)`, async ({ puppeteer: { page }, descriptor }) => {
  const value = await page.evaluate(async descriptor => {
          // @ts-ignore
          const instance = new window.Logic.Grantable(descriptor)
          instance.query()
          return instance.status
        }, descriptor),
        expected = 'querying'
  
  assert.is(value, expected)
})

suite(`status is 'queried' after successful query(...)`, async ({ puppeteer: { page }, descriptor }) => {
  const value = await page.evaluate(async descriptor => {
          // @ts-ignore
          const instance = new window.Logic.Grantable(descriptor)
          await instance.query()
          return instance.status
        }, descriptor),
        expected = 'queried'
  
  assert.is(value, expected)
})

suite(`status is 'errored' after unsuccessful query(...)`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          // @ts-ignore
          const instance = new window.Logic.Grantable({ name: 'stub' })
          await instance.query()
          return instance.status
        }),
        expected = 'errored'
  
  assert.is(value, expected)
})

suite(`permission is stored after successful query(...)`, async ({ puppeteer: { page }, descriptor }) => {
  const value = await page.evaluate(async descriptor => {
          // @ts-ignore
          const instance = new window.Logic.Grantable(descriptor)
          await instance.query()
          return instance.permission.state
        }, descriptor),
        expected = 'prompt'
  
  assert.equal(value, expected)
})

suite.run()
