import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import { WithLogic } from '../fixtures/types'

type Context = {
  key: string,
}

const suite = withPuppeteer(
  createSuite<Context>('Storeable (browser)')
)

suite.before(context => {
  context.key = 'baleada'
})

suite('stores the key', async ({ puppeteer: { page }, key }) => {
  const value = await page.evaluate(key => {
          const instance = new (window as unknown as WithLogic).Logic.Storeable(key)
          return instance.key
        }, key),
        expected = key
  
  assert.is(value, expected)
})

suite('assignment sets the key', async ({ puppeteer: { page }, key }) => {
  const value = await page.evaluate(key => {
          const instance = new (window as unknown as WithLogic).Logic.Storeable(key)
          instance.key = 'toolkit'
          return instance.key
        }, key),
        expected = 'toolkit'
  
  assert.is(value, expected)
})

suite('setKey sets the key', async ({ puppeteer: { page }, key }) => {
  const value = await page.evaluate(key => {
          const instance = new (window as unknown as WithLogic).Logic.Storeable(key)
          instance.setKey('toolkit')
          return instance.key
        }, key),
        expected = 'toolkit'
  
  assert.is(value, expected)
})

suite('status is "ready" after construction and before DOM is available', async ({ puppeteer: { page }, key }) => {
  const value = await page.evaluate(key => {
          const instance = new (window as unknown as WithLogic).Logic.Storeable(key)
          return instance.status
        }, key),
        expected = 'ready'
  
  assert.is(value, expected)
})

suite(`status is stored in browser when DOM is available`, async ({ puppeteer: { page }, key }) => {
  const value = await page.evaluate(async key => {
          const instance = new (window as unknown as WithLogic).Logic.Storeable(key)
          
          const value = JSON.parse(JSON.stringify(instance.storage))
          
          window.localStorage.clear()
          
          return value
        }, key),
        expected = { [`${key}_status`]: 'ready' }
    
  assert.equal(value, expected)
})

suite(`status is 'stored' after successful store(...)`, async ({ puppeteer: { page }, key }) => {
  const value = await page.evaluate(async key => {
          const instance = new (window as unknown as WithLogic).Logic.Storeable(key)
          instance.store('baleada')
          
          const value = instance.status
          
          window.localStorage.clear()
          
          return value
        }, key),
        expected = 'stored'
    
  assert.is(value, expected)
})

suite(`status is 'removed' after successful remove(...)`, async ({ puppeteer: { page }, key }) => {
  const value = await page.evaluate(async key => {
          const instance = new (window as unknown as WithLogic).Logic.Storeable(key)
          instance.store('baleada')
          instance.remove()
          
          const value = instance.status
          
          window.localStorage.clear()
          
          return value
        }, key),
        expected = 'removed'
    
  assert.is(value, expected)
})

suite.skip(`status is 'errored' after unsuccessful store(...)`, async ({ puppeteer: { page }, key }) => {
  const value = await page.evaluate(async key => {
          // Not sure how to force a storage error
        }, key),
        expected = 'error'
    
  assert.is(value, expected)
})

suite(`status is not stored in browser after successful removeStatus(...)`, async ({ puppeteer: { page }, key }) => {
  const value = await page.evaluate(async key => {
          const instance = new (window as unknown as WithLogic).Logic.Storeable(key)
          instance.removeStatus()
          
          const value = instance.storage.getItem(`${key}_status`)
          
          window.localStorage.clear()
          
          return value
        }, key),
        expected = null
    
  assert.is(value, expected)
})

suite(`setKey(...) updates browser storage keys when status is 'stored'`, async ({ puppeteer: { page }, key }) => {
  const value = await page.evaluate(async key => {
          const instance = new (window as unknown as WithLogic).Logic.Storeable(key)
          instance
            .store('baleada')
            .setKey('stub')
          
          const value = JSON.parse(JSON.stringify(instance.storage))
          
          window.localStorage.clear()
          
          return value
        }, key),
        expected = { stub: 'baleada', stub_status: 'stored' }
    
  assert.equal(value, expected)
})

suite(`setKey(...) updates browser storage keys when status is 'removed'`, async ({ puppeteer: { page }, key }) => {
  const value = await page.evaluate(async key => {
          const instance = new (window as unknown as WithLogic).Logic.Storeable(key)
          instance
            .store('baleada')
            .remove()
            .setKey('stub')
          
          const value = JSON.parse(JSON.stringify(instance.storage))
          
          window.localStorage.clear()
          
          return value
        }, key),
        expected = { stub_status: 'removed' }
    
  assert.equal(value, expected)
})

suite(`store(...) stores item in browser storage`, async ({ puppeteer: { page }, key }) => {
  const value = await page.evaluate(async key => {
          const instance = new (window as unknown as WithLogic).Logic.Storeable(key)
          instance.store('baleada')
          
          const value = JSON.parse(JSON.stringify(instance.storage))
          
          window.localStorage.clear()
          
          return value
        }, key),
        expected = { [`${key}`]: 'baleada', [`${key}_status`]: 'stored' }
    
  assert.equal(value, expected)
})

suite(`string accesses stored item`, async ({ puppeteer: { page }, key }) => {
  const value = await page.evaluate(async key => {
          const instance = new (window as unknown as WithLogic).Logic.Storeable(key)
          instance.store('baleada')
          
          const value = instance.string 
          
          window.localStorage.clear()
          
          return value
        }, key),
        expected = 'baleada'
    
  assert.equal(value, expected)
})

suite(`remove(...) removes item from browser storage`, async ({ puppeteer: { page }, key }) => {
  const value = await page.evaluate(async key => {
          const instance = new (window as unknown as WithLogic).Logic.Storeable(key)
          instance
            .store('baleada')
            .remove()
          
          const value = JSON.parse(JSON.stringify(instance.storage))
          
          window.localStorage.clear()
          
          return value
        }, key),
        expected = { [`${key}_status`]: 'removed' }
    
  assert.equal(value, expected)
})

suite(`respects statusKeySuffix option`, async ({ puppeteer: { page }, key }) => {
  const value = await page.evaluate(async key => {
          const instance = new (window as unknown as WithLogic).Logic.Storeable(key, { statusKeySuffix: '_stub' })
          
          const value = JSON.parse(JSON.stringify(instance.storage))
          
          window.localStorage.clear()
          
          return value
        }, key),
        expected = { [`${key}_stub`]: 'ready' }
    
  assert.equal(value, expected)
})

suite(`statusKeySuffix defaults to '_status'`, async ({ puppeteer: { page }, key }) => {
  const value = await page.evaluate(async key => {
          const instance = new (window as unknown as WithLogic).Logic.Storeable(key)
          
          const value = JSON.parse(JSON.stringify(instance.storage))
          
          window.localStorage.clear()
          
          return value
        }, key),
        expected = { [`${key}_status`]: 'ready' }
    
  assert.equal(value, expected)
})

suite(`respects type option`, async ({ puppeteer: { page }, key }) => {
  const value = await page.evaluate(async key => {
          // @ts-ignore
          new window.Logic.Storeable(key, { type: 'session' })
  
          const value = JSON.parse(JSON.stringify(window.sessionStorage))
        
          window.sessionStorage.clear()
          
          return value
        }, key),
        expected = { [`${key}_status`]: 'ready' }
    
  assert.equal(value, expected)
})

suite(`type defaults to localStorage`, async ({ puppeteer: { page }, key }) => {
  const value = await page.evaluate(async key => {
          // @ts-ignore
          new window.Logic.Storeable(key)
  
          const value = JSON.parse(JSON.stringify(window.localStorage))
        
          window.localStorage.clear()
          
          return value
        }, key),
        expected = { [`${key}_status`]: 'ready' }
    
  assert.equal(value, expected)
})


suite.run()
