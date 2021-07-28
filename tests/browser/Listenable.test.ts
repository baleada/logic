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

suite(`listen(...) handles intersect`, async ({ puppeteer: { reloadNext, page } }) => {
  const value = await page.evaluate(async () => {
          let value = false
          const instance = new (window as unknown as WithLogic).Logic.Listenable<IntersectionObserverEntry>('intersect')
          
          instance.listen(() => value = true, { target: document.body })
        
          return new Promise(resolve => {
            setTimeout(() => resolve(value), 20)
          })
        }),
        expected = true

  assert.is(value, expected)

  reloadNext()
})

suite(`listen(...) handles mutate`, async ({ puppeteer: { reloadNext, page } }) => {
  const value = await page.evaluate(async () => {
          let value = false
          const instance = new (window as unknown as WithLogic).Logic.Listenable<MutationRecord>('mutate')
          
          instance.listen(() => value = true, { target: document.body, observe: { attributes: true } })
          document.body.classList.add('stub')
        
          return new Promise(resolve => {
            setTimeout(() => resolve(value), 20)
          })
        }),
        expected = true

  assert.is(value, expected)

  reloadNext()
})

suite(`listen(...) handles resize`, async ({ puppeteer: { reloadNext, page } }) => {
  const value = await page.evaluate(async () => {
          let value = false
          const instance = new (window as unknown as WithLogic).Logic.Listenable<ResizeObserverEntry>('resize')
          
          instance.listen(() => value = true, { target: document.body })
          const bodyHeight = document.body.getBoundingClientRect().height
          document.body.style.height = `${bodyHeight + 1}px`
        
          return new Promise(resolve => {
            setTimeout(() => resolve(value), 20)
          })
        }),
        expected = true

  assert.is(value, expected)

  reloadNext()
})

suite(`listen(...) handles media queries`, async ({ puppeteer: { reloadNext, page } }) => {
  await page.evaluate(async () => {
    (window as unknown as WithLogic).testState = {
      value: false,
      instance: new (window as unknown as WithLogic).Logic.Listenable<MediaQueryListEvent>('(min-width: 900px)')
        .listen(() => (window as unknown as WithLogic).testState.value = true)
    }
  })
  
  // Puppeteer viewport defaults to 800x600
  // Setting to 901 should trigger the 900px media query listener
  await page.setViewport({ width: 901, height: 600 })

  const value = await page.evaluate(() => {
          return new Promise(resolve => {
            setTimeout(() => resolve((window as unknown as WithLogic).testState.value), 20)
          })
        }),
        expected = true

  assert.is(value, expected)

  reloadNext()
})

suite(`listen(...) handles idle`, async ({ puppeteer: { reloadNext, page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new (window as unknown as WithLogic).Logic.Listenable('idle')
          instance.listen(() => {})
          // Not sure how to smartly trigger idle event
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
          // Not sure how to smartly trigger visibilitychange event
          return instance.active.size === 1
        }),
        expected = true

  assert.is(value, expected)

  reloadNext()
})

suite(`listen(...) handles keycombos`, async ({ puppeteer: { reloadNext, page } }) => {
  await page.evaluate(async () => {
    (window as unknown as WithLogic).testState = {
      value: false,
      instance: new (window as unknown as WithLogic).Logic.Listenable<KeyboardEvent>('cmd+b')
        .listen(() => (window as unknown as WithLogic).testState.value = true)
    }
  })

  await page.keyboard.down('Meta')
  await page.keyboard.down('B')

  const value = await page.evaluate(() => {
          return new Promise(resolve => {
            setTimeout(() => resolve((window as unknown as WithLogic).testState.value), 20)
          })
        }),
        expected = true

  assert.is(value, expected)

  reloadNext()
})

suite(`listen(...) handles left click combos`, async ({ puppeteer: { reloadNext, page } }) => {
  await page.evaluate(async () => {
    (window as unknown as WithLogic).testState = {
      value: false,
      instance: new (window as unknown as WithLogic).Logic.Listenable<MouseEvent>('cmd+mousedown')
        .listen(() => (window as unknown as WithLogic).testState.value = true)
    }
  })

  await page.keyboard.down('Meta')
  await page.mouse.down()

  const value = await page.evaluate(() => {
          return new Promise(resolve => {
            setTimeout(() => resolve((window as unknown as WithLogic).testState.value), 20)
          })
        }),
        expected = true

  assert.is(value, expected)

  reloadNext()
})

suite(`listen(...) handles right click combos`, async ({ puppeteer: { reloadNext, page } }) => {
  await page.evaluate(async () => {
    (window as unknown as WithLogic).testState = {
      value: false,
      instance: new (window as unknown as WithLogic).Logic.Listenable<MouseEvent>('cmd+rightclick')
        .listen(() => (window as unknown as WithLogic).testState.value = true)
    }
  })

  await page.keyboard.down('Meta')
  await page.mouse.click(100, 100, { button: 'right' })

  const value = await page.evaluate(() => {
          return new Promise(resolve => {
            setTimeout(() => resolve((window as unknown as WithLogic).testState.value), 20)
          })
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
          let value = false
          const instance = new (window as unknown as WithLogic).Logic.Listenable<ResizeObserverEntry>('resize')
          
          instance.listen(() => value = true, { target: document.body })
          instance.stop()
          const bodyHeight = document.body.getBoundingClientRect().height
          document.body.style.height = `${bodyHeight + 1}px`
        
          return new Promise(resolve => {
            setTimeout(() => resolve(value), 20)
          })
        }),
        expected = false

  assert.is(value, expected)

})

suite(`stop(...) handles media queries`, async ({ puppeteer: { page } }) => {
  await page.evaluate(async () => {
    (window as unknown as WithLogic).testState = {
      value: false,
      instance: new (window as unknown as WithLogic).Logic.Listenable<MediaQueryListEvent>('(min-width: 900px)')
        .listen(() => (window as unknown as WithLogic).testState.value = true)
    };

    (window as unknown as WithLogic).testState.instance.stop()
  })
  
  // Puppeteer viewport defaults to 800x600
  // Setting to 901 should trigger the 900px media query listener
  await page.setViewport({ width: 901, height: 600 })

  const value = await page.evaluate(() => {
          return new Promise(resolve => {
            setTimeout(() => resolve((window as unknown as WithLogic).testState.value), 20)
          })
        }),
        expected = false

  assert.is(value, expected)

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
  await page.evaluate(async () => {
    (window as unknown as WithLogic).testState = {
      value: false,
      instance: new (window as unknown as WithLogic).Logic.Listenable<KeyboardEvent>('cmd+b')
        .listen(() => (window as unknown as WithLogic).testState.value = true)
    };

    (window as unknown as WithLogic).testState.instance.stop()
  })

  await page.keyboard.down('Meta')
  await page.keyboard.down('B')

  const value = await page.evaluate(() => {
          return new Promise(resolve => {
            setTimeout(() => resolve((window as unknown as WithLogic).testState.value), 20)
          })
        }),
        expected = false

  assert.is(value, expected)

})

suite(`stop(...) handles left click combos`, async ({ puppeteer: { page } }) => {
  await page.evaluate(async () => {
    (window as unknown as WithLogic).testState = {
      value: false,
      instance: new (window as unknown as WithLogic).Logic.Listenable<MouseEvent>('cmd+mousedown')
        .listen(() => (window as unknown as WithLogic).testState.value = true)
    };

    (window as unknown as WithLogic).testState.instance.stop()
  })

  await page.keyboard.down('Meta')
  await page.mouse.down()

  const value = await page.evaluate(() => {
          return new Promise(resolve => {
            setTimeout(() => resolve((window as unknown as WithLogic).testState.value), 20)
          })
        }),
        expected = false

  assert.is(value, expected)
})

suite(`stop(...) handles right click combos`, async ({ puppeteer: { page } }) => {
  await page.evaluate(async () => {
    (window as unknown as WithLogic).testState = {
      value: false,
      instance: new (window as unknown as WithLogic).Logic.Listenable<MouseEvent>('cmd+rightclick')
        .listen(() => (window as unknown as WithLogic).testState.value = true)
    };

    (window as unknown as WithLogic).testState.instance.stop()
  })

  await page.keyboard.down('Meta')
  await page.mouse.click(100, 100, { button: 'right' })

  const value = await page.evaluate(() => {
          return new Promise(resolve => {
            setTimeout(() => resolve((window as unknown as WithLogic).testState.value), 20)
          })
        }),
        expected = false

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

suite(`status is 'listening' when stop(...) is limited to a target such that not all active listeners are removed`, async ({ puppeteer: { page } }) => {
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
