import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'
import { withPlaywrightOptions } from '../fixtures/withPlaywrightOptions'

const suite = withPlaywright(
  createSuite('Listenable'),
  withPlaywrightOptions
)

suite('stores the type', async ({ playwright: { page } }) => {
  const value = await page.evaluate(() => {
          const instance = new window.Logic.Listenable('click')
          return instance.type
        }),
        expected = 'click'

  assert.is(value, expected)
})

suite('assignment sets the type', async ({ playwright: { page } }) => {
  const value = await page.evaluate(() => {
          const instance = new window.Logic.Listenable('click')
          instance.type = 'keydown'
          return instance.type
        }),
        expected = 'keydown'

  assert.is(value, expected)
})

suite('setType sets the type', async ({ playwright: { page } }) => {
  const value = await page.evaluate(() => {
          const instance = new window.Logic.Listenable('click')
          instance.setType('keydown')
          return instance.type
        }),
        expected = 'keydown'

  assert.is(value, expected)
})

suite('active is empty after construction', async ({ playwright: { page } }) => {
  const value = await page.evaluate(() => {
          const instance = new window.Logic.Listenable('click')
          return instance.active.size
        }),
        expected = 0

  assert.is(value, expected)
})

suite('status is "ready" after construction', async ({ playwright: { page } }) => {
  const value = await page.evaluate(() => {
          const instance = new window.Logic.Listenable('click')
          return instance.status
        }),
        expected = 'ready'

  assert.is(value, expected)
})

suite('status is \'listening\' after successful listen(...)', async ({ playwright: { page, reloadNext } }) => {
  const value = await page.evaluate(async () => {
          const instance = new window.Logic.Listenable('click')
          instance.listen(() => {})
          return instance.status
        }),
        expected = 'listening'

  assert.is(value, expected)

  reloadNext()
})

suite('status is \'stopped\' after successful stop(...)', async ({ playwright: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new window.Logic.Listenable('click')
          instance.listen(() => {})
          instance.stop()
          return instance.status
        }),
        expected = 'stopped'

  assert.is(value, expected)
})

suite('listen(...) adds event to active', async ({ playwright: { page, reloadNext } }) => {
  const value = await page.evaluate(async () => {
          const instance = new window.Logic.Listenable('click')
          instance.listen(() => {})
          return instance.active.size
        }),
        expected = 1

  assert.is(value, expected)

  reloadNext()
})

suite('stop(...) removes event from active', async ({ playwright: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new window.Logic.Listenable('click')
          instance.listen(() => {})
          instance.stop()
          return instance.active.size
        }),
        expected = 0

  assert.is(value, expected)
})

suite('listen(...) handles intersect', async ({ playwright: { page, reloadNext } }) => {
  const value = await page.evaluate(async () => {
          let value = false
          const instance = new window.Logic.Listenable('intersect')

          instance.listen(() => value = true, { target: document.body })

          return new Promise(resolve => {
            setTimeout(() => resolve(value), 20)
          })
        }),
        expected = true

  assert.is(value, expected)

  reloadNext()
})

suite('listen(...) handles mutate', async ({ playwright: { page, reloadNext } }) => {
  const value = await page.evaluate(async () => {
          let value = false
          const instance = new window.Logic.Listenable('mutate')

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

suite('listen(...) handles resize', async ({ playwright: { page, reloadNext } }) => {
  const value = await page.evaluate(async () => {
          let value = false
          const instance = new window.Logic.Listenable('resize')

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

suite('listen(...) handles media queries', async ({ playwright: { page, reloadNext } }) => {
  await page.setViewportSize({ width: 800, height: 600 })

  await page.evaluate(async () => {
    window.testState = {
      value: false,
      instance: new window.Logic.Listenable('(min-width: 900px)')
        .listen(() => window.testState.value = true),
    }
  })

  await page.setViewportSize({ width: 901, height: 600 })

  const value = await page.evaluate(() => {
          return new Promise(resolve => {
            setTimeout(() => resolve(window.testState.value), 20)
          })
        }),
        expected = true

  assert.is(value, expected)

  reloadNext()
})

suite('listen(...) handles idle', async ({ playwright: { page, reloadNext } }) => {
  const value = await page.evaluate(async () => {
          const instance = new window.Logic.Listenable('idle')
          instance.listen(() => {})
          // Not sure how to smartly trigger idle event
          return typeof instance.active.values().next().value.id === 'number'
        }),
        expected = true

  assert.is(value, expected)

  reloadNext()
})

suite('listen(...) handles message', async ({ playwright: { page, reloadNext } }) => {
  await page.evaluate(async () => {
    const instance = new window.Logic.Listenable('message')
    instance.listen(event => window.testState = event.data)
  })

  const page2: typeof page = await page.context().newPage()
  await page2.goto('http://localhost:5173')
  await page2.evaluate(() => {
    new BroadcastChannel('baleada').postMessage('baleada')
  })

  const value = await page.evaluate(async () => {
          return window.testState
        }),
        expected = 'baleada'

  assert.is(value, expected)

  reloadNext()
})

// Not sure how to trigger messageerror
suite.skip('listen(...) handles messageerror', async () => {})

suite('listen(...) handles visibility change', async ({ playwright: { page, reloadNext } }) => {
  const value = await page.evaluate(async () => {
          const instance = new window.Logic.Listenable('visibilitychange')
          instance.listen(() => {})
          // Not sure how to smartly trigger visibilitychange event
          return instance.active.size === 1
        }),
        expected = true

  assert.is(value, expected)

  reloadNext()
})

suite('listen(...) handles recognizeable', async ({ playwright: { page, reloadNext } }) => {
  const value = await page.evaluate(async () => {
          const instance = new window.Logic.Listenable('recognizeable' as 'keydown' | 'mousedown', {
            recognizeable: {
              effects: {
                keydown: () => {},
                mousedown: () => {},
              },
            },
          })
          instance.listen(() => {})
          return instance.active.size === 2
        }),
        expected = true

  assert.is(value, expected)

  reloadNext()
})

suite('listen(...) stores recognizeable', async ({ playwright: { page, reloadNext } }) => {
  const value = await page.evaluate(async () => {
          const instance = new window.Logic.Listenable('recognizeable' as 'keydown' | 'mousedown', {
            recognizeable: {
              effects: {
                keydown: () => {},
                mousedown: () => {},
              },
            },
          })
          instance.listen(() => {})
          return instance.recognizeable instanceof window.Logic.Recognizeable
        }),
        expected = true

  assert.is(value, expected)

  reloadNext()
})

suite('listen(...) calls effect when recognizeable status is recognized', async ({ playwright: { page, reloadNext } }) => {
  await page.evaluate(async () => {
    const instance = new window.Logic.Listenable('recognizeable' as 'keydown', {
      recognizeable: {
        effects: {
          keydown: (event, { recognized }) => {
            recognized()
          },
        },
      },
    })
    window.testState = 0
    instance.listen(() => {
      window.testState++
    })
  })

  await page.keyboard.down('B')
  await page.keyboard.down('B')
  await page.keyboard.down('B')

  const value = await page.evaluate(() => {
          return window.testState
        }),
        expected = 3

  assert.is(value, expected)

  reloadNext()
})

suite('stop(...) handles observations', async ({ playwright: { page } }) => {
  const value = await page.evaluate(async () => {
          let value = false
          const instance = new window.Logic.Listenable('resize')

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

suite('stop(...) handles media queries', async ({ playwright: { page } }) => {
  await page.setViewportSize({ width: 800, height: 600 })

  await page.evaluate(async () => {
    window.testState = {
      value: false,
      instance: new window.Logic.Listenable('(min-width: 900px)')
        .listen(() => window.testState.value = true),
    }

    window.testState.instance.stop()
  })

  await page.setViewportSize({ width: 901, height: 600 })

  const value = await page.evaluate(() => {
          return new Promise(resolve => {
            setTimeout(() => resolve(window.testState.value), 20)
          })
        }),
        expected = false

  assert.is(value, expected)

})

suite('stop(...) handles idle', async ({ playwright: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new window.Logic.Listenable('idle')
          instance.listen(() => {})
          instance.stop()
          return instance.active.size
        }),
        expected = 0

  assert.is(value, expected)
})

suite('stop(...) handles visibility change', async ({ playwright: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new window.Logic.Listenable('visibilitychange')
          instance.listen(() => {})
          instance.stop()
          return instance.active.size
        }),
        expected = 0

  assert.is(value, expected)
})

suite('stop(...) handles keycombos', async ({ playwright: { page } }) => {
  await page.evaluate(async () => {
    window.testState = {
      value: false,
      instance: new window.Logic.Listenable('keydown')
        .listen(event => {
          const matches = window.Logic.createKeycomboMatch('cmd+b')
          if (matches(event)) window.testState.value = true
        }),
    }

    window.testState.instance.stop()
  })

  await page.keyboard.down('Meta')
  await page.keyboard.down('B')

  const value = await page.evaluate(() => {
          return new Promise(resolve => {
            setTimeout(() => resolve(window.testState.value), 20)
          })
        }),
        expected = false

  assert.is(value, expected)

})

suite('stop(...) handles recognizeable', async ({ playwright: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new window.Logic.Listenable('recognizeable' as 'keydown' | 'mousedown', {
            recognizeable: {
              effects: {
                keydown: () => {},
                mousedown: () => {},
              },
            },

          })
          instance.listen(() => {})
          instance.stop()
          return instance.active.size
        }),
        expected = 0

  assert.is(value, expected)
})

// TODO: test recognizeable.stops

suite('stop(...) can be limited to a target', async ({ playwright: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new window.Logic.Listenable('click')
          instance.listen(() => {})
          instance.listen(() => {}, { target: document.body })
          const before = instance.active.size
          instance.stop({ target: document.body })
          return { before, after: instance.active.size }
        }),
        expected = { before: 2, after: 1 }

  assert.equal(value, expected)
})

suite('status is \'listening\' when stop(...) is limited to a target such that not all active listeners are removed', async ({ playwright: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new window.Logic.Listenable('click')
          instance.listen(() => {})
          instance.listen(() => {}, { target: document.body })
          instance.stop({ target: document.body })
          return instance.status
        }),
        expected = 'listening'

  assert.is(value, expected)
})

suite.run()
