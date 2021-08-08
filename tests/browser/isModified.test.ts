import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import { WithLogic } from '../fixtures/types'

const suite = withPuppeteer(
  createSuite('isModified')
)

suite(`detects shift`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          return {
            true: (window as unknown as WithLogic).Logic_extracted.isModified({ event: new MouseEvent('click', { shiftKey: true }), alias: 'shift' }),
            false: (window as unknown as WithLogic).Logic_extracted.isModified({ event: new MouseEvent('click', { shiftKey: false }), alias: 'shift' })
          }
        })

  assert.ok(value.true)
  assert.not.ok(value.false)
})

suite(`detects meta`, async ({ puppeteer: { page } }) => {
  (async () => {
    const value = await page.evaluate(async () => {
            return {
              true: (window as unknown as WithLogic).Logic_extracted.isModified({ event: new MouseEvent('click', { metaKey: true }), alias: 'cmd' }),
              false: (window as unknown as WithLogic).Logic_extracted.isModified({ event: new MouseEvent('click', { metaKey: false }), alias: 'cmd' })
            }
          })

    assert.ok(value.true)
    assert.not.ok(value.false)
  })();
  
  (async () => {
    const value = await page.evaluate(async () => {
            return {
              true: (window as unknown as WithLogic).Logic_extracted.isModified({ event: new MouseEvent('click', { metaKey: true }), alias: 'command' }),
              false: (window as unknown as WithLogic).Logic_extracted.isModified({ event: new MouseEvent('click', { metaKey: false }), alias: 'command' })
            }
          })

    assert.ok(value.true)
    assert.not.ok(value.false)
  })();
  
  (async () => {
    const value = await page.evaluate(async () => {
            return {
              true: (window as unknown as WithLogic).Logic_extracted.isModified({ event: new MouseEvent('click', { metaKey: true }), alias: 'meta' }),
              false: (window as unknown as WithLogic).Logic_extracted.isModified({ event: new MouseEvent('click', { metaKey: false }), alias: 'meta' })
            }
          })

    assert.ok(value.true)
    assert.not.ok(value.false)
  })();
})

suite(`detects control`, async ({ puppeteer: { page } }) => {
  (async () => {
    const value = await page.evaluate(async () => {
            return {
              true: (window as unknown as WithLogic).Logic_extracted.isModified({ event: new MouseEvent('click', { ctrlKey: true }), alias: 'control' }),
              false: (window as unknown as WithLogic).Logic_extracted.isModified({ event: new MouseEvent('click', { ctrlKey: false }), alias: 'control' })
            }
          })

    assert.ok(value.true)
    assert.not.ok(value.false)
  })();
  
  (async () => {
    const value = await page.evaluate(async () => {
            return {
              true: (window as unknown as WithLogic).Logic_extracted.isModified({ event: new MouseEvent('click', { ctrlKey: true }), alias: 'ctrl' }),
              false: (window as unknown as WithLogic).Logic_extracted.isModified({ event: new MouseEvent('click', { ctrlKey: false }), alias: 'ctrl' })
            }
          })

    assert.ok(value.true)
    assert.not.ok(value.false)
  })();
})

suite(`detects alt`, async ({ puppeteer: { page } }) => {
  (async () => {
    const value = await page.evaluate(async () => {
            return {
              true: (window as unknown as WithLogic).Logic_extracted.isModified({ event: new MouseEvent('click', { altKey: true }), alias: 'alt' }),
              false: (window as unknown as WithLogic).Logic_extracted.isModified({ event: new MouseEvent('click', { altKey: false }), alias: 'alt' })
            }
          })

    assert.ok(value.true)
    assert.not.ok(value.false)
  })();
  
  (async () => {
    const value = await page.evaluate(async () => {
            return {
              true: (window as unknown as WithLogic).Logic_extracted.isModified({ event: new MouseEvent('click', { altKey: true }), alias: 'option' }),
              false: (window as unknown as WithLogic).Logic_extracted.isModified({ event: new MouseEvent('click', { altKey: false }), alias: 'option' })
            }
          })

    assert.ok(value.true)
    assert.not.ok(value.false)
  })();
  
  (async () => {
    const value = await page.evaluate(async () => {
            return {
              true: (window as unknown as WithLogic).Logic_extracted.isModified({ event: new MouseEvent('click', { altKey: true }), alias: 'opt' }),
              false: (window as unknown as WithLogic).Logic_extracted.isModified({ event: new MouseEvent('click', { altKey: false }), alias: 'opt' })
            }
          })

    assert.ok(value.true)
    assert.not.ok(value.false)
  })();
})

suite.run()