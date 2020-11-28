import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import withBrowseable from '../util/withBrowseable.js'
import { Resolveable } from '../fixtures/TEST_BUNDLE.js'

const suite = withBrowseable(
  createSuite('Fetchable (browser)')
)

suite.before(context => {
  context.resource = 'http://httpbin.org/get'
})

suite.before.each(async ({ page }) => {
  await page.goto('http://localhost:3000/Logic')
  await page.waitForSelector('h1')
})

suite(`status is 'fetching' immediately after fetch(...)`, async ({ page, resource }) => {
  const value = await page.evaluate(async resource => {
          const instance = new window.Logic.Fetchable(resource)
          instance.fetch() // Can't method chain without await
          return instance.status
        }, resource),
        expected = 'fetching'

  assert.is(value, expected)
})

suite(`status is 'fetched' after successful fetch(...)`, async ({ page, resource }) => {
  const value = await page.evaluate(async resource => {
          const instance = new window.Logic.Fetchable(resource)
          return (await instance.fetch()).status
        }, resource),
        expected = 'fetched'

  assert.is(value, expected)
})

suite(`status is 'fetched' after successful get(...)`, async ({ page, resource }) => {
  const value = await page.evaluate(async resource => {
          const instance = new window.Logic.Fetchable(resource)
          return (await instance.get()).status
        }, resource),
        expected = 'fetched'

  assert.is(value, expected)
})

suite.skip(`status is 'fetched' after successful patch(...)`, async ({ page, resource }) => {
  const value = await page.evaluate(async resource => {
          const instance = new window.Logic.Fetchable(resource.replace(/get$/, 'patch'))
          return (await instance.post()).status // TODO: Error: Failed to fetch. Not sure why.
        }, resource),
        expected = 'fetched'

  assert.is(value, expected)
})

suite(`status is 'fetched' after successful post(...)`, async ({ page, resource }) => {
  const value = await page.evaluate(async resource => {
          const instance = new window.Logic.Fetchable(resource.replace(/get$/, 'post'))
          return (await instance.post()).status
        }, resource),
        expected = 'fetched'

  assert.is(value, expected)
})

suite(`status is 'fetched' after successful put(...)`, async ({ page, resource }) => {
  const value = await page.evaluate(async resource => {
          const instance = new window.Logic.Fetchable(resource.replace(/get$/, 'put'))
          return (await instance.put()).status
        }, resource),
        expected = 'fetched'

  assert.is(value, expected)
})

suite(`status is 'fetched' after successful delete(...)`, async ({ page, resource }) => {
  const value = await page.evaluate(async resource => {
          const instance = new window.Logic.Fetchable(resource.replace(/get$/, 'delete'))
          return (await instance.delete()).status
        }, resource),
        expected = 'fetched'

  assert.is(value, expected)
})

suite.skip(`status is 'errored' after an unsuccessful fetch(...)`, async ({ page, resource }) => {
  const value = await page.evaluate(async resource => {
          const instance = new window.Logic.Fetchable('stub')
          // Not sure how to simulate a network failure. Fetch won't technically fail otherwise.
        }, resource),
        expected = 'errored'

  assert.is(value, expected)
})

suite(`status is 'aborted' after aborting fetch(...)`, async ({ page, resource }) => {
  const value = await page.evaluate(async resource => {
          const instance = new window.Logic.Fetchable(resource)
          instance.fetch()
          return (await instance.abort()).status
        }, resource),
        expected = 'aborted'

  assert.is(value, expected)
})

suite(`response is Response after successful fetch(...)`, async ({ page, resource }) => {
  const value = await page.evaluate(async resource => {
          const instance = new window.Logic.Fetchable(resource)
          await instance.fetch()
          return instance.response instanceof Response
        }, resource)

  assert.ok(value)
})

suite.skip(`response is Error after errored fetch(...)`, async ({ page, resource }) => {
  const value = await page.evaluate(async resource => {
          const instance = new window.Logic.Fetchable(resource)
          // Not sure how to simulate network failure
        }, resource)

  assert.ok(value)
})

suite(`response is AbortError after aborted fetch(...)`, async ({ page, resource }) => {
  const value = await page.evaluate(async resource => {
          const instance = new window.Logic.Fetchable(resource)
          instance.fetch()
          return (await instance.abort()).response.name === 'AbortError'
        }, resource)

  assert.ok(value)
})

suite(`arrayBuffer is Resolveable after successful fetch(...)`, async ({ page, resource }) => {
  const value = await page.evaluate(async resource => {
          const instance = new window.Logic.Fetchable(resource)
          await instance.get()
          const arrayBuffer = await instance.arrayBuffer
          return arrayBuffer instanceof window.Logic.Resolveable
        }, resource)

  assert.ok(value)
})

suite(`blob is Resolveable after successful fetch(...)`, async ({ page, resource }) => {
  const value = await page.evaluate(async resource => {
          const instance = new window.Logic.Fetchable(resource)
          await instance.get()
          const blob = await instance.blob
          return blob instanceof window.Logic.Resolveable
        }, resource)

  assert.ok(value)
})

suite(`formData is Resolveable after successful fetch(...)`, async ({ page, resource }) => {
  const value = await page.evaluate(async resource => {
          const instance = new window.Logic.Fetchable(resource)
          await instance.get()
          const formData = await instance.formData
          return formData instanceof window.Logic.Resolveable
        }, resource)

  assert.ok(value)
})

suite(`json is Resolveable after successful fetch(...)`, async ({ page, resource }) => {
  const value = await page.evaluate(async resource => {
          const instance = new window.Logic.Fetchable(resource)
          await instance.get()
          const json = await instance.json
          return json instanceof window.Logic.Resolveable
        }, resource)

  assert.ok(value)
})

suite(`text is Resolveable after successful fetch(...)`, async ({ page, resource }) => {
  const value = await page.evaluate(async resource => {
          const instance = new window.Logic.Fetchable(resource)
          await instance.get()
          const text = await instance.text
          return text instanceof window.Logic.Resolveable
        }, resource)

  assert.ok(value)
})

suite(`abortController can be accessed`, async ({ page, resource }) => {
  const value = await page.evaluate(async resource => {
          const instance = new window.Logic.Fetchable(resource)
          return instance.abortController instanceof AbortController
        }, resource)

  assert.ok(value)
})


suite.run()