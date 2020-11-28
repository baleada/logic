import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import withBrowseable from '../util/withBrowseable.js'

const suite = withBrowseable(
  createSuite('Fetchable (browser)')
)

suite.before(context => {
  context.resource = 'http://httpbin.org/get'
})

suite.before.each(async ({ page }) => {
  await page.goto('http://localhost:3000/Fetchable')
  await page.waitForSelector('h1')
})

suite(`status is 'fetching' immediately after fetch(...)`, async ({ page, resource }) => {
  const value = await page.evaluate(async resource => {
          const instance = new window.Fetchable(resource)
          instance.fetch() // Can't method chain without await
          return instance.status
        }, resource),
        expected = 'fetching'

  assert.is(value, expected)
})

suite(`status is 'fetched' after a successful fetch(...)`, async ({ page, resource }) => {
  const value = await page.evaluate(async resource => {
          const instance = new window.Fetchable(resource)
          return (await instance.fetch()).status
        }, resource),
        expected = 'fetched'

  assert.is(value, expected)
})

suite(`status is 'fetched' after a successful get(...)`, async ({ page, resource }) => {
  const value = await page.evaluate(async resource => {
          const instance = new window.Fetchable(resource)
          return (await instance.get()).status
        }, resource),
        expected = 'fetched'

  assert.is(value, expected)
})

suite.skip(`status is 'fetched' after a successful patch(...)`, async ({ page, resource }) => {
  const value = await page.evaluate(async resource => {
          const instance = new window.Fetchable(resource.replace(/get$/, 'patch'))
          return (await instance.post()).status // TODO: Error: Failed to fetch. Not sure why.
        }, resource),
        expected = 'fetched'

  assert.is(value, expected)
})

suite(`status is 'fetched' after a successful post(...)`, async ({ page, resource }) => {
  const value = await page.evaluate(async resource => {
          const instance = new window.Fetchable(resource.replace(/get$/, 'post'))
          return (await instance.post()).status
        }, resource),
        expected = 'fetched'

  assert.is(value, expected)
})

suite(`status is 'fetched' after a successful put(...)`, async ({ page, resource }) => {
  const value = await page.evaluate(async resource => {
          const instance = new window.Fetchable(resource.replace(/get$/, 'put'))
          return (await instance.put()).status
        }, resource),
        expected = 'fetched'

  assert.is(value, expected)
})

suite(`status is 'fetched' after a successful delete(...)`, async ({ page, resource }) => {
  const value = await page.evaluate(async resource => {
          const instance = new window.Fetchable(resource.replace(/get$/, 'delete'))
          return (await instance.delete()).status
        }, resource),
        expected = 'fetched'

  assert.is(value, expected)
})

suite.skip(`status is 'errored' after an unsuccessful fetch(...)`, async ({ page, resource }) => {
  const value = await page.evaluate(async resource => {
          const instance = new window.Fetchable('stub')
          // Not sure how to simulate a network failure. Fetch won't technically fail otherwise.
        }, resource),
        expected = 'errored'

  assert.is(value, expected)
})

suite(`status is 'aborted' after aborting fetch(...)`, async ({ page, resource }) => {
  const value = await page.evaluate(async resource => {
          const instance = new window.Fetchable(resource)
          instance.fetch()
          return (await instance.abort()).status
        }, resource),
        expected = 'aborted'

  assert.is(value, expected)
})

suite(`response is Response after successful fetch(...)`, async ({ page, resource }) => {
  const value = await page.evaluate(async resource => {
          const instance = new window.Fetchable(resource)
          await instance.fetch()
          return instance.response instanceof Response
        }, resource),
        expected = true

  assert.is(value, expected)
})

suite.skip(`response is Error after errored fetch(...)`, async ({ page, resource }) => {
  const value = await page.evaluate(async resource => {
          const instance = new window.Fetchable(resource)
          // Not sure how to simulate network failure
        }, resource),
        expected = true

  assert.is(value, expected)
})

suite(`response is AbortError after aborted fetch(...)`, async ({ page, resource }) => {
  const value = await page.evaluate(async resource => {
          const instance = new window.Fetchable(resource)
          instance.fetch()
          return (await instance.abort()).response.name === 'AbortError'
        }, resource),
        expected = true

  assert.is(value, expected)
})

suite.run()
