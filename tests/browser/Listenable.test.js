import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

const suite = withPuppeteer(
  createSuite('Listenable (browser)')
)

suite.before.each(async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000')
})

suite(`status is 'listening' after successful listen(...)`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new window.Logic.Listenable('stub')
          instance.listen(() => {})
          return instance.status
        }),
        expected = 'listening'

  assert.is(value, expected)
})

suite(`status is 'stopped' after successful listen(...)`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new window.Logic.Listenable('stub')
          instance.listen(() => {})
          instance.stop()
          return instance.status
        }),
        expected = 'stopped'

  assert.is(value, expected)
})

suite(`listen(...) adds event to activeListeners`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new window.Logic.Listenable('stub')
          instance.listen(() => {})
          return instance.activeListeners.length
        }),
        expected = 1

  assert.is(value, expected)
})

suite(`stop(...) removes event from activeListeners`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new window.Logic.Listenable('stub')
          instance.listen(() => {})
          instance.stop()
          return instance.activeListeners.length
        }),
        expected = 0

  assert.is(value, expected)
})

suite(`listen(...) handles observations`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new window.Logic.Listenable('intersect')
          instance.listen(() => {})
          return instance.activeListeners[0].id instanceof IntersectionObserver
        }),
        expected = true

  assert.is(value, expected)
})

suite(`listen(...) handles media queries`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new window.Logic.Listenable('(min-width: 600px)')
          instance.listen(() => {})
          return instance.activeListeners[0].target instanceof MediaQueryList
        }),
        expected = true

  assert.is(value, expected)
})

suite(`listen(...) handles idle`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new window.Logic.Listenable('idle')
          instance.listen(() => {})
          return typeof instance.activeListeners[0].id === 'number'
        }),
        expected = true

  assert.is(value, expected)
})

suite(`listen(...) handles visibility change`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new window.Logic.Listenable('visibilitychange')
          instance.listen(() => {})
          return instance.activeListeners[0].category === 'event'
        }),
        expected = true

  assert.is(value, expected)
})

suite(`listen(...) handles keycombos`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new window.Logic.Listenable('cmd+b')
          instance.listen(() => {})
          return instance.activeListeners[0].category === 'event'
        }),
        expected = true

  assert.is(value, expected)
})

suite(`listen(...) handles left click combos`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new window.Logic.Listenable('cmd+click')
          instance.listen(() => {})
          return instance.activeListeners[0].category === 'event'
        }),
        expected = true

  assert.is(value, expected)
})

suite(`listen(...) handles right click combos`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new window.Logic.Listenable('cmd+rightclick')
          instance.listen(() => {})
          return instance.activeListeners[0].category === 'event'
        }),
        expected = true

  assert.is(value, expected)
})

suite(`listen(...) handles recognizeable`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new window.Logic.Listenable('recognizeable', { recognizeable: { handlers: { 'keydown': () => {}, 'mousedown': () => {} } } })
          instance.listen(() => {})
          return instance.activeListeners.length === 2 && instance.activeListeners.every(({ category }) => category === 'event')
        }),
        expected = true

  assert.is(value, expected)
})

suite(`listen(...) stores recognizeable`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new window.Logic.Listenable('recognizeable', { recognizeable: { handlers: { 'keydown': () => {}, 'mousedown': () => {} } } })
          instance.listen(() => {})
          return instance.recognizeable instanceof window.Logic.Recognizeable
        }),
        expected = true

  assert.is(value, expected)
})

suite(`stop(...) handles observations`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new window.Logic.Listenable('intersect')
          instance.listen(() => {})
          instance.stop()
          return instance.activeListeners.length
        }),
        expected = 0

  assert.is(value, expected)
})

suite(`stop(...) handles media queries`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new window.Logic.Listenable('(min-width: 600px)')
          instance.listen(() => {})
          instance.stop()
          return instance.activeListeners.length
        }),
        expected = 0

  assert.is(value, expected)
})

suite(`stop(...) handles idle`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new window.Logic.Listenable('idle')
          instance.listen(() => {})
          instance.stop()
          return instance.activeListeners.length
        }),
        expected = 0

  assert.is(value, expected)
})

suite(`stop(...) handles visibility change`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new window.Logic.Listenable('visibilitychange')
          instance.listen(() => {})
          instance.stop()
          return instance.activeListeners.length
        }),
        expected = 0

  assert.is(value, expected)
})

suite(`stop(...) handles keycombos`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new window.Logic.Listenable('cmd+b')
          instance.listen(() => {})
          instance.stop()
          return instance.activeListeners.length
        }),
        expected = 0

  assert.is(value, expected)
})

suite(`stop(...) handles left click combos`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new window.Logic.Listenable('cmd+click')
          instance.listen(() => {})
          instance.stop()
          return instance.activeListeners.length
        }),
        expected = 0

  assert.is(value, expected)
})

suite(`stop(...) handles right click combos`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new window.Logic.Listenable('cmd+rightclick')
          instance.listen(() => {})
          instance.stop()
          return instance.activeListeners.length
        }),
        expected = 0

  assert.is(value, expected)
})

suite(`stop(...) handles recognizeable`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new window.Logic.Listenable('recognizeable', { recognizeable: { handlers: { 'keydown': () => {}, 'mousedown': () => {} } } })
          instance.listen(() => {})
          instance.stop()
          return instance.activeListeners.length
        }),
        expected = 0

  assert.is(value, expected)
})

suite(`stop(...) can be limited to a target`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new window.Logic.Listenable('stub')
          instance.listen(() => {})
          instance.listen(() => {}, { target: document.body })
          const before = instance.activeListeners.length
          instance.stop(document.body)
          return { before, after: instance.activeListeners.length }
        }),
        expected = { before: 2, after: 1 }

  assert.equal(value, expected)
})

suite(`status is 'listening' when stop(...) is limited to a target such that not all active listeners are removed`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new window.Logic.Listenable('stub')
          instance.listen(() => {})
          instance.listen(() => {}, { target: document.body })
          instance.stop(document.body)
          return instance.status
        }),
        expected = 'listening'

  assert.is(value, expected)
})



suite.run()
