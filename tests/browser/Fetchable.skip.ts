import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

const suite = withPuppeteer(
  createSuite('Fetchable')
)

suite.before(context => {
  context.resource = 'http://httpbin.org/get'
})

suite('stores the resource', async ({ puppeteer: { page }, resource }) => {
  const value = await page.evaluate(resource => {
          const instance = new window.Logic.Fetchable(resource)
          return instance.resource
        }, resource),
        expected = 'http://httpbin.org/get'
  
  assert.is(value, expected)
})

suite('assignment sets the resource', async ({ puppeteer: { page }, resource }) => {
  const value = await page.evaluate(resource => {
          const instance = new window.Logic.Fetchable(resource)
          instance.resource = 'http://httpbin.org/post'
          return instance.resource
        }, resource),
        expected = 'http://httpbin.org/post'

  assert.is(value, expected)
})

suite('setResource sets the resource', async ({ puppeteer: { page }, resource }) => {
  const value = await page.evaluate(resource => {
          const instance = new window.Logic.Fetchable(resource)
          instance.setResource('http://httpbin.org/post')
          return instance.resource
        }, resource),
        expected = 'http://httpbin.org/post'

  assert.is(value, expected)
})

suite('status is "ready" after construction', async ({ puppeteer: { page }, resource }) => {
  const value = await page.evaluate(resource => {
          const instance = new window.Logic.Fetchable(resource)
          return instance.status
        }, resource),
        expected = 'ready'

  assert.is(value, expected)
})

suite('status is "fetching" immediately after fetch(...)', async ({ puppeteer: { page }, resource }) => {
  const value = await page.evaluate(async resource => {
          const instance = new window.Logic.Fetchable(resource)
          instance.fetch() // Can't method chain without await
          return instance.status
        }, resource),
        expected = 'fetching'

  assert.is(value, expected)
})

suite('status is "fetched" after successful fetch(...)', async ({ puppeteer: { page }, resource }) => {
  const value = await page.evaluate(async resource => {
          const instance = new window.Logic.Fetchable(resource)
          return (await instance.fetch()).status
        }, resource),
        expected = 'fetched'

  assert.is(value, expected)
})

suite('status is "fetched" after successful get(...)', async ({ puppeteer: { page }, resource }) => {
  const value = await page.evaluate(async resource => {
          const instance = new window.Logic.Fetchable(resource)
          return (await instance.get()).status
        }, resource),
        expected = 'fetched'

  assert.is(value, expected)
})

suite.skip('status is "fetched" after successful patch(...)', async ({ puppeteer: { page }, resource }) => {
  const value = await page.evaluate(async resource => {
          const instance = new window.Logic.Fetchable(resource.replace(/get$/, 'patch'))
          return (await instance.post()).status // TODO: Error: Failed to fetch. Not sure why.
        }, resource),
        expected = 'fetched'

  assert.is(value, expected)
})

suite('status is "fetched" after successful post(...)', async ({ puppeteer: { page }, resource }) => {
  const value = await page.evaluate(async resource => {
          const instance = new window.Logic.Fetchable(resource.replace(/get$/, 'post'))
          return (await instance.post()).status
        }, resource),
        expected = 'fetched'

  assert.is(value, expected)
})

suite('status is "fetched" after successful put(...)', async ({ puppeteer: { page }, resource }) => {
  const value = await page.evaluate(async resource => {
          const instance = new window.Logic.Fetchable(resource.replace(/get$/, 'put'))
          return (await instance.put()).status
        }, resource),
        expected = 'fetched'

  assert.is(value, expected)
})

suite('status is "fetched" after successful delete(...)', async ({ puppeteer: { page }, resource }) => {
  const value = await page.evaluate(async resource => {
          const instance = new window.Logic.Fetchable(resource.replace(/get$/, 'delete'))
          return (await instance.delete()).status
        }, resource),
        expected = 'fetched'

  assert.is(value, expected)
})

suite('status is "retrying" after retry', async ({ puppeteer: { page }, resource }) => {
  const value = await page.evaluate(async () => {
          const instance = new window.Logic.Fetchable('http://www.httpbin.dev/get')
          instance.get({ retry: 1 })

          await (new Promise(resolve => {
            requestAnimationFrame(resolve)
          }))

          return instance.status
        }, resource),
        expected = 'retrying'

  assert.is(value, expected)
})

suite('status is "errored" after error', async ({ puppeteer: { page }, resource }) => {
  const value = await page.evaluate(async () => {
          const instance = new window.Logic.Fetchable('http://www.httpbin.dev/get')
          await instance.get()

          // await (new Promise(resolve => {
          //   requestAnimationFrame(resolve)
          // }))

          return instance.status
        }, resource),
        expected = 'errored'

  assert.is(value, expected)
})

suite('status is "aborted" after aborting fetch(...)', async ({ puppeteer: { page }, resource }) => {
  const value = await page.evaluate(async resource => {
          const instance = new window.Logic.Fetchable(resource)
          instance.fetch()
          instance.abort()
          await (new Promise(resolve => {
            requestAnimationFrame(resolve)
          }))
          return instance.status
        }, resource),
        expected = 'aborted'

  assert.is(value, expected)
})

suite('response is Response after successful fetch(...)', async ({ puppeteer: { page }, resource }) => {
  const value = await page.evaluate(async resource => {
          const instance = new window.Logic.Fetchable(resource)
          await instance.fetch()
          return instance.response instanceof Response
        }, resource)

  assert.ok(value)
})

suite.skip('response is Error after errored fetch(...)', async ({ puppeteer: { page }, resource }) => {
  const value = await page.evaluate(async resource => {
          const instance = new window.Logic.Fetchable(resource)
          // Not sure how to simulate network failure
        }, resource)

  assert.ok(value)
})

suite('response is AbortError after aborted fetch(...)', async ({ puppeteer: { page }, resource }) => {
  const value = await page.evaluate(async resource => {
          const instance = new window.Logic.Fetchable(resource)
          instance.fetch()
          instance.abort()
          await (new Promise(resolve => {
            requestAnimationFrame(resolve)
          }))
          return instance.error.name === 'AbortError'
        }, resource)

  assert.ok(value)
})

suite('arrayBuffer is Resolveable after successful fetch(...)', async ({ puppeteer: { page }, resource }) => {
  const value = await page.evaluate(async resource => {
          const instance = new window.Logic.Fetchable(resource)
          await instance.get()
          const arrayBuffer = instance.arrayBuffer
          return arrayBuffer instanceof window.Logic.Resolveable
        }, resource)

  assert.ok(value)
})

suite('blob is Resolveable after successful fetch(...)', async ({ puppeteer: { page }, resource }) => {
  const value = await page.evaluate(async resource => {
          const instance = new window.Logic.Fetchable(resource)
          await instance.get()
          const blob = instance.blob
          return blob instanceof window.Logic.Resolveable
        }, resource)

  assert.ok(value)
})

suite('formData is Resolveable after successful fetch(...)', async ({ puppeteer: { page }, resource }) => {
  const value = await page.evaluate(async resource => {
          const instance = new window.Logic.Fetchable(resource)
          await instance.get()
          const formData = instance.formData
          return formData instanceof window.Logic.Resolveable
        }, resource)

  assert.ok(value)
})

suite('json is Resolveable after successful fetch(...)', async ({ puppeteer: { page }, resource }) => {
  const value = await page.evaluate(async resource => {
          const instance = new window.Logic.Fetchable(resource)
          await instance.get()
          const json = instance.json
          return json instanceof window.Logic.Resolveable
        }, resource)

  assert.ok(value)
})

suite('text is Resolveable after successful fetch(...)', async ({ puppeteer: { page }, resource }) => {
  const value = await page.evaluate(async resource => {
          const instance = new window.Logic.Fetchable(resource)
          await instance.get()
          const text = instance.text
          return text instanceof window.Logic.Resolveable
        }, resource)

  assert.ok(value)
})

suite('abortController can be accessed', async ({ puppeteer: { page }, resource }) => {
  const value = await page.evaluate(async resource => {
          const instance = new window.Logic.Fetchable(resource)
          return instance.abortController instanceof AbortController
        }, resource)

  assert.ok(value)
})


suite.run()
