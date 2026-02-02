import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'
import { withPlaywrightOptions } from '../fixtures/withPlaywrightOptions'

type Context = {
  key: string,
}

const suite = withPlaywright(
  createSuite<Context>('Storeable'),
  withPlaywrightOptions
)

suite.before(context => {
  context.key = 'baleada'
})

suite('stores the key', async ({ playwright: { page }, key }) => {
  const value = await page.evaluate(key => {
          const instance = new window.Logic.Storeable(key)
          return instance.key
        }, key),
        expected = key

  assert.is(value, expected)
})

suite('assignment sets the key', async ({ playwright: { page }, key }) => {
  const value = await page.evaluate(key => {
          const instance = new window.Logic.Storeable(key)
          instance.key = 'toolkit'
          return instance.key
        }, key),
        expected = 'toolkit'

  assert.is(value, expected)
})

suite('setKey sets the key', async ({ playwright: { page }, key }) => {
  const value = await page.evaluate(key => {
          const instance = new window.Logic.Storeable(key)
          instance.setKey('toolkit')
          return instance.key
        }, key),
        expected = 'toolkit'

  assert.is(value, expected)
})

suite('status is "ready" after construction and before DOM is available', async ({ playwright: { page }, key }) => {
  const value = await page.evaluate(key => {
          const instance = new window.Logic.Storeable(key)
          return instance.status
        }, key),
        expected = 'ready'

  assert.is(value, expected)
})

suite(`status is stored in browser when DOM is available`, async ({ playwright: { page }, key }) => {
  const value = await page.evaluate(async key => {
          const instance = new window.Logic.Storeable(key)

          const value = JSON.parse(JSON.stringify(instance.storage))

          window.localStorage.clear()

          return value
        }, key),
        expected = { [`${key} status`]: 'ready' }

  assert.equal(value, expected)
})

suite(`status is 'stored' after successful store(...)`, async ({ playwright: { page }, key }) => {
  const value = await page.evaluate(async key => {
          const instance = new window.Logic.Storeable(key)
          instance.store('baleada')

          const value = instance.status

          window.localStorage.clear()

          return value
        }, key),
        expected = 'stored'

  assert.is(value, expected)
})

suite(`status is 'removed' after successful remove(...)`, async ({ playwright: { page }, key }) => {
  const value = await page.evaluate(async key => {
          const instance = new window.Logic.Storeable(key)
          instance.store('baleada')
          instance.remove()

          const value = instance.status

          window.localStorage.clear()

          return value
        }, key),
        expected = 'removed'

  assert.is(value, expected)
})

suite.skip(`status is 'errored' after unsuccessful store(...)`, async ({ playwright: { page }, key }) => {
  const value = await page.evaluate(async key => {
          // Not sure how to force a storage error
        }, key),
        expected = 'error'

  assert.is(value, expected)
})

suite(`status is not stored in browser after successful removeStatus(...)`, async ({ playwright: { page }, key }) => {
  const value = await page.evaluate(async key => {
          const instance = new window.Logic.Storeable(key)
          instance.removeStatus()

          const value = instance.storage.getItem(`${key} status`)

          window.localStorage.clear()

          return value
        }, key),
        expected = null

  assert.is(value, expected)
})

suite(`setKey(...) updates browser storage keys when status is 'stored'`, async ({ playwright: { page }, key }) => {
  const value = await page.evaluate(async key => {
          const instance = new window.Logic.Storeable(key)
          instance
            .store('baleada')
            .setKey('stub')

          const value = JSON.parse(JSON.stringify(instance.storage))

          window.localStorage.clear()

          return value
        }, key),
        expected = { stub: 'baleada', 'stub status': 'stored' }

  assert.equal(value, expected)
})

suite(`setKey(...) updates browser storage keys when status is 'removed'`, async ({ playwright: { page }, key }) => {
  const value = await page.evaluate(async key => {
          const instance = new window.Logic.Storeable(key)
          instance
            .store('baleada')
            .remove()
            .setKey('stub')

          const value = JSON.parse(JSON.stringify(instance.storage))

          window.localStorage.clear()

          return value
        }, key),
        expected = { 'stub status': 'removed' }

  assert.equal(value, expected)
})

suite(`store(...) stores item in browser storage`, async ({ playwright: { page }, key }) => {
  const value = await page.evaluate(async key => {
          const instance = new window.Logic.Storeable(key)
          instance.store('baleada')

          const value = JSON.parse(JSON.stringify(instance.storage))

          window.localStorage.clear()

          return value
        }, key),
        expected = { [`${key}`]: 'baleada', [`${key} status`]: 'stored' }

  assert.equal(value, expected)
})

suite(`string accesses stored item`, async ({ playwright: { page }, key }) => {
  const value = await page.evaluate(async key => {
          const instance = new window.Logic.Storeable(key)
          instance.store('baleada')

          const value = instance.string

          window.localStorage.clear()

          return value
        }, key),
        expected = 'baleada'

  assert.equal(value, expected)
})

suite(`remove(...) removes item from browser storage`, async ({ playwright: { page }, key }) => {
  const value = await page.evaluate(async key => {
          const instance = new window.Logic.Storeable(key)
          instance
            .store('baleada')
            .remove()

          const value = JSON.parse(JSON.stringify(instance.storage))

          window.localStorage.clear()

          return value
        }, key),
        expected = { [`${key} status`]: 'removed' }

  assert.equal(value, expected)
})

suite(`respects statusKeySuffix option`, async ({ playwright: { page }, key }) => {
  const value = await page.evaluate(async key => {
          const instance = new window.Logic.Storeable(key, { statusKeySuffix: ' stub' })

          const value = JSON.parse(JSON.stringify(instance.storage))

          window.localStorage.clear()

          return value
        }, key),
        expected = { [`${key} stub`]: 'ready' }

  assert.equal(value, expected)
})

suite(`statusKeySuffix defaults to ' status'`, async ({ playwright: { page }, key }) => {
  const value = await page.evaluate(async key => {
          const instance = new window.Logic.Storeable(key)

          const value = JSON.parse(JSON.stringify(instance.storage))

          window.localStorage.clear()

          return value
        }, key),
        expected = { [`${key} status`]: 'ready' }

  assert.equal(value, expected)
})

suite(`respects kind option`, async ({ playwright: { page }, key }) => {
  const value = await page.evaluate(async key => {
          // @ts-ignore
          new window.Logic.Storeable(key, { kind: 'session' })

          const value = JSON.parse(JSON.stringify(window.sessionStorage))

          window.sessionStorage.clear()

          return value
        }, key),
        expected = { [`${key} status`]: 'ready' }

  assert.equal(value, expected)
})

suite(`kind defaults to localStorage`, async ({ playwright: { page }, key }) => {
  const value = await page.evaluate(async key => {
          // @ts-ignore
          new window.Logic.Storeable(key)

          const value = JSON.parse(JSON.stringify(window.localStorage))

          window.localStorage.clear()

          return value
        }, key),
        expected = { [`${key} status`]: 'ready' }

  assert.equal(value, expected)
})


suite.run()
