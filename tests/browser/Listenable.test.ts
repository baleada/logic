import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import type { WithLogic } from '../fixtures/types'

const suite = withPuppeteer(
  createSuite('Listenable')
)

suite('stores the type', async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          const instance = new (window as unknown as WithLogic).Logic.Listenable('click')
          return instance.type
        }),
        expected = 'click'

  assert.is(value, expected)
})

suite('assignment sets the type', async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          const instance = new (window as unknown as WithLogic).Logic.Listenable('click')
          instance.type = 'keydown'
          return instance.type
        }),
        expected = 'keydown'

  assert.is(value, expected)
})

suite('setType sets the type', async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          const instance = new (window as unknown as WithLogic).Logic.Listenable('click')
          instance.setType('keydown')
          return instance.type
        }),
        expected = 'keydown'

  assert.is(value, expected)
})

suite('active is empty after construction', async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          const instance = new (window as unknown as WithLogic).Logic.Listenable('click')
          return instance.active.size
        }),
        expected = 0

  assert.is(value, expected)
})

suite('status is "ready" after construction', async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          const instance = new (window as unknown as WithLogic).Logic.Listenable('click')
          return instance.status
        }),
        expected = 'ready'

  assert.is(value, expected)
})

suite(`status is 'listening' after successful listen(...)`, async ({ puppeteer: { reloadNext, page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new (window as unknown as WithLogic).Logic.Listenable('stub')
          instance.listen(() => {})
          return instance.status
        }),
        expected = 'listening'

  assert.is(value, expected)

  reloadNext()
})

suite(`status is 'stopped' after successful stop(...)`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new (window as unknown as WithLogic).Logic.Listenable('stub')
          instance.listen(() => {})
          instance.stop()
          return instance.status
        }),
        expected = 'stopped'

  assert.is(value, expected)
})

suite(`listen(...) adds event to active`, async ({ puppeteer: { reloadNext, page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new (window as unknown as WithLogic).Logic.Listenable('stub')
          instance.listen(() => {})
          return instance.active.size
        }),
        expected = 1

  assert.is(value, expected)

  reloadNext()
})

suite(`stop(...) removes event from active`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new (window as unknown as WithLogic).Logic.Listenable('stub')
          instance.listen(() => {})
          instance.stop()
          return instance.active.size
        }),
        expected = 0

  assert.is(value, expected)
})

suite(`listen(...) handles observations`, async ({ puppeteer: { reloadNext, page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new (window as unknown as WithLogic).Logic.Listenable('intersect')
          instance.listen(() => {})
          return instance.active.values().next().value.id instanceof IntersectionObserver
        }),
        expected = true

  assert.is(value, expected)

  reloadNext()
})

suite(`listen(...) handles media queries`, async ({ puppeteer: { reloadNext, page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new (window as unknown as WithLogic).Logic.Listenable('(min-width: 600px)')
          instance.listen(() => {})
          return instance.active.values().next().value.target instanceof MediaQueryList
        }),
        expected = true

  assert.is(value, expected)

  reloadNext()
})

suite(`listen(...) handles idle`, async ({ puppeteer: { reloadNext, page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new (window as unknown as WithLogic).Logic.Listenable('idle')
          instance.listen(() => {})
          return typeof instance.active.values().next().value.id === 'number'
        }),
        expected = true

  assert.is(value, expected)

  reloadNext()
})

suite(`listen(...) handles visibility change`, async ({ puppeteer: { reloadNext, page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new (window as unknown as WithLogic).Logic.Listenable('visibilitychange')
          instance.listen(() => {})
          return instance.active.size === 1
        }),
        expected = true

  assert.is(value, expected)

  reloadNext()
})

suite(`listen(...) handles keycombos`, async ({ puppeteer: { reloadNext, page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new (window as unknown as WithLogic).Logic.Listenable('cmd+b')
          instance.listen(() => {})
          return instance.active.size === 1
        }),
        expected = true

  assert.is(value, expected)

  reloadNext()
})

suite(`listen(...) handles left click combos`, async ({ puppeteer: { reloadNext, page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new (window as unknown as WithLogic).Logic.Listenable('cmd+click')
          instance.listen(() => {})
          return instance.active.size === 1
        }),
        expected = true

  assert.is(value, expected)

  reloadNext()
})

suite(`listen(...) handles right click combos`, async ({ puppeteer: { reloadNext, page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new (window as unknown as WithLogic).Logic.Listenable('cmd+rightclick')
          instance.listen(() => {})
          return instance.active.size === 1
        }),
        expected = true

  assert.is(value, expected)
  
  reloadNext()
})

suite(`listen(...) handles recognizeable`, async ({ puppeteer: { reloadNext, page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new (window as unknown as WithLogic).Logic.Listenable('recognizeable', { recognizeable: { handlers: { 'keydown': () => {}, 'mousedown': () => {} } } })
          instance.listen(() => {})
          return instance.active.size === 2
        }),
        expected = true

  assert.is(value, expected)

  reloadNext()
})

suite(`listen(...) stores recognizeable`, async ({ puppeteer: { reloadNext, page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new (window as unknown as WithLogic).Logic.Listenable('recognizeable', { recognizeable: { handlers: { 'keydown': () => {}, 'mousedown': () => {} } } })
          instance.listen(() => {})
          return instance.recognizeable instanceof (window as unknown as WithLogic).Logic.Recognizeable
        }),
        expected = true

  assert.is(value, expected)

  reloadNext()
})

suite(`stop(...) handles observations`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new (window as unknown as WithLogic).Logic.Listenable('intersect')
          instance.listen(() => {})
          instance.stop()
          return instance.active.size
        }),
        expected = 0

  assert.is(value, expected)
})

suite(`stop(...) handles media queries`, async ({ puppeteer: { reloadNext, page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new (window as unknown as WithLogic).Logic.Listenable('(min-width: 600px)')
          instance.listen(() => {})
          instance.stop()
          return instance.active.size
        }),
        expected = 0

  assert.is(value, expected)

  reloadNext()
})

suite(`stop(...) handles idle`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new (window as unknown as WithLogic).Logic.Listenable('idle')
          instance.listen(() => {})
          instance.stop()
          return instance.active.size
        }),
        expected = 0

  assert.is(value, expected)
})

suite(`stop(...) handles visibility change`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new (window as unknown as WithLogic).Logic.Listenable('visibilitychange')
          instance.listen(() => {})
          instance.stop()
          return instance.active.size
        }),
        expected = 0

  assert.is(value, expected)
})

suite(`stop(...) handles keycombos`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new (window as unknown as WithLogic).Logic.Listenable('cmd+b')
          instance.listen(() => {})
          instance.stop()
          return instance.active.size
        }),
        expected = 0

  assert.is(value, expected)
})

suite(`stop(...) handles left click combos`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new (window as unknown as WithLogic).Logic.Listenable('cmd+click')
          instance.listen(() => {})
          instance.stop()
          return instance.active.size
        }),
        expected = 0

  assert.is(value, expected)
})

suite(`stop(...) handles right click combos`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new (window as unknown as WithLogic).Logic.Listenable('cmd+rightclick')
          instance.listen(() => {})
          instance.stop()
          return instance.active.size
        }),
        expected = 0

  assert.is(value, expected)
})

suite(`stop(...) handles recognizeable`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new (window as unknown as WithLogic).Logic.Listenable('recognizeable', { recognizeable: { handlers: { 'keydown': () => {}, 'mousedown': () => {} } } })
          instance.listen(() => {})
          instance.stop()
          return instance.active.size
        }),
        expected = 0

  assert.is(value, expected)
})

suite(`stop(...) can be limited to a target`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new (window as unknown as WithLogic).Logic.Listenable<Event>('stub')
          instance.listen(() => {})
          instance.listen(() => {}, { target: document.body })
          const before = instance.active.size
          instance.stop({ target: document.body })
          return { before, after: instance.active.size }
        }),
        expected = { before: 2, after: 1 }

  assert.equal(value, expected)
})

suite(`status is 'listening' when stop(...) is limited to a target such that not all active listeners are removed`, async ({ puppeteer: { reloadNext, page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new (window as unknown as WithLogic).Logic.Listenable<Event>('stub')
          instance.listen(() => {})
          instance.listen(() => {}, { target: document.body })
          instance.stop({ target: document.body })
          return instance.status
        }),
        expected = 'listening'

  assert.is(value, expected)
})

suite.run()
