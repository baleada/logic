import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import type { WithGlobals } from '../fixtures/types'

const suite = withPuppeteer(
  createSuite('Recognizeable')
)

suite(`stores the sequence`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
    return new (window as unknown as WithGlobals).Logic.Recognizeable([]).sequence
  })

  assert.equal(value, [])
})

suite(`assignment sets the sequence`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
    const instance = new (window as unknown as WithGlobals).Logic.Recognizeable<'click', any>([])
    instance.sequence = [new MouseEvent('click')]
    return instance.sequence.length
  })

  assert.is(value, 1)
})

suite(`setSequence sets the sequence`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
    const instance = new (window as unknown as WithGlobals).Logic.Recognizeable<'click', any>([])
    instance.setSequence([new MouseEvent('click')])
    return instance.sequence.length
  })

  assert.is(value, 1)
})

suite(`first recognize(sequenceItem) sets status to recognizing`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
    const instance = new (window as unknown as WithGlobals).Logic.Recognizeable<'click', any>([])
    instance.recognize(new MouseEvent('click'))
    return instance.status
  })

  assert.is(value, 'recognizing')
})

suite(`recognize(sequenceItem) calls effect`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
    let effectWasCalled = false
    
    const instance = new (window as unknown as WithGlobals).Logic.Recognizeable<'click' | 'keydown', any>(
      [],
      {
        effects: defineEffect => [
          defineEffect('click', () => effectWasCalled = true),
          defineEffect('keydown', () => effectWasCalled = true)
        ]
      }
    )
    
    instance.recognize(new MouseEvent('click'))
    
    return effectWasCalled
  })

  assert.is(value, true)
})

suite(`effect API recognized() sets status`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
    const instance = new (window as unknown as WithGlobals).Logic.Recognizeable<'click', any>(
      [],
      {
        effects: defineEffect => [
          defineEffect('click', ({ recognized }) => recognized())
        ]
      }
    )
    
    instance.recognize(new MouseEvent('click'))
    
    
    return instance.status
  })

  assert.is(value, 'recognized')
})

suite(`effect API denied() sets status`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
    const instance = new (window as unknown as WithGlobals).Logic.Recognizeable<'click', any>(
      [],
      {
        effects: defineEffect => [
          defineEffect('click', ({ denied }) => denied())
        ]
      }
    )
    
    instance.recognize(new MouseEvent('click'))
    
    
    return instance.status
  })

  assert.is(value, 'denied')
})

suite(`effect API getSequence() gets the new sequence`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
    let sequence

    const instance = new (window as unknown as WithGlobals).Logic.Recognizeable<'click', any>(
      [],
      {
        effects: defineEffect => [
          defineEffect('click', ({ getSequence }) => sequence = getSequence())
        ]
      }
    )
    
    instance.recognize(new MouseEvent('click'))
    
    return {
      fromInstance: JSON.stringify(instance.sequence),
      fromApi: JSON.stringify(sequence),
    }
  })

  assert.is(value.fromInstance, value.fromApi)
})

suite(`effect API getStatus() gets status`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
    let status

    const instance = new (window as unknown as WithGlobals).Logic.Recognizeable<'click', any>(
      [],
      {
        effects: defineEffect => [
          defineEffect('click', ({ getStatus }) => status = getStatus())
        ]
      }
    )
    
    instance.recognize(new MouseEvent('click'))
    
    return {
      fromInstance: instance.status,
      fromApi: status,
    }
  })

  assert.equal(value.fromInstance, value.fromApi)
})

suite(`effect API getMetadata() gets metadata`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
    let metadata

    const instance = new (window as unknown as WithGlobals).Logic.Recognizeable<'click', any>(
      [],
      {
        effects: defineEffect => [
          defineEffect('click', ({ getMetadata }) => metadata = getMetadata())
        ]
      }
    )
    
    instance.recognize(new MouseEvent('click'))
    
    return {
      fromInstance: JSON.stringify(instance.metadata),
      fromApi: JSON.stringify(metadata),
    }
  })

  assert.is(value.fromInstance, value.fromApi)
})

suite(`effect API getMetadata() is a reference to metadata`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
    let metadata

    const instance = new (window as unknown as WithGlobals).Logic.Recognizeable<'click', any>(
      [],
      {
        effects: defineEffect => [
          defineEffect('click', ({ getMetadata }) => metadata = getMetadata())
        ]
      }
    )
    
    instance.recognize(new MouseEvent('click'))

    // Mutating the getMetadata return value should affect the instance's metadata
    metadata.stub = 'stub'
    
    return {
      fromInstance: JSON.stringify(instance.metadata),
      fromApi: JSON.stringify(metadata),
    }
  })

  assert.is(value.fromInstance, value.fromApi)
})

suite(`effect API setMetadata() sets metadata`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
    const instance = new (window as unknown as WithGlobals).Logic.Recognizeable<'click', any>(
      [],
      {
        effects: defineEffect => [
          defineEffect('click', ({ setMetadata }) => setMetadata({ stub: 'stub' }))
        ]
      }
    )
    
    instance.recognize(new MouseEvent('click'))
    
    return instance.metadata
  })

  assert.equal(value, { stub: 'stub' })
})

suite(`effect API onRecognized() performs side effect`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
    let onRecognizedStatus = 'not performed'
    const onRecognized = () => onRecognizedStatus = 'performed'

    const instance = new (window as unknown as WithGlobals).Logic.Recognizeable<'click', any>(
      [],
      {
        effects: defineEffect => [
          defineEffect('click', ({ sequenceItem, onRecognized: o }) => o(sequenceItem))
        ]
      }
    )
    
    instance.recognize(new MouseEvent('click'), { onRecognized })
    
    return onRecognizedStatus
  })

  assert.equal(value, 'performed')
})

suite(`effect API sequenceItem accesses sequenceItem`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
    let result

    const instance = new (window as unknown as WithGlobals).Logic.Recognizeable<'click', any>(
      [],
      {
        effects: defineEffect => [
          defineEffect('click', ({ sequenceItem }) => result = sequenceItem.type)
        ]
      }
    )
    
    instance.recognize(new MouseEvent('click'))
    
    return result
  })

  assert.equal(value, 'click')
})

/* status */
suite(`status is 'ready' after construction`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
    return new (window as unknown as WithGlobals).Logic.Recognizeable([]).status
  })

  assert.is(value, 'ready')
})

suite(`status is 'recognizing' after recognize(...) is called at least once and effects did not call recognized or denied`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
    return new (window as unknown as WithGlobals).Logic.Recognizeable<'click', any>([])
      .recognize(new MouseEvent('click'))
      .status
  })

  assert.is(value, 'recognizing')
})

suite(`correctly routes IntersectionObserverEntry[]`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new (window as unknown as WithGlobals).Logic.Recognizeable<'intersect', any>(
                  [],
                  {
                    effects: defineEffect => [
                      defineEffect('intersect', ({ recognized }) => recognized())
                    ]
                  }
                ),
                observer = new IntersectionObserver(entries => {
                  instance.recognize(entries)
                })
                
          observer.observe(document.body)
        
          return new Promise(resolve => {
            setTimeout(() => resolve(instance.status), 20)
          })
        }),
        expected = 'recognized'

  assert.is(value, expected)
})

suite(`correctly routes MutationRecord[]`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new (window as unknown as WithGlobals).Logic.Recognizeable<'mutate', any>(
                  [],
                  {
                    effects: defineEffect => [
                      defineEffect('mutate', ({ recognized }) => recognized())
                    ]
                  }
                ),
                observer = new MutationObserver(records => {
                  instance.recognize(records)
                })
                
          observer.observe(document.body, { attributes: true })
          document.body.classList.add('stub')
        
          return new Promise(resolve => {
            setTimeout(() => resolve(instance.status), 20)
          })
        }),
        expected = 'recognized'

  assert.is(value, expected)
})

suite(`correctly routes ResizeObserverEntry[]`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new (window as unknown as WithGlobals).Logic.Recognizeable<'resize', any>(
                  [],
                  {
                    effects: defineEffect => [
                      defineEffect('resize', ({ recognized }) => recognized())
                    ]
                  }
                ),
                observer = new ResizeObserver(entries => {
                  instance.recognize(entries)
                })
                
          observer.observe(document.body)
          const bodyHeight = document.body.getBoundingClientRect().height
          document.body.style.height = `${bodyHeight + 1}px`
                
          return new Promise(resolve => {
            setTimeout(() => resolve(instance.status), 20)
          })
        }),
        expected = 'recognized'

  assert.is(value, expected)
})

suite(`correctly routes MediaQueryListEvent`, async ({ puppeteer: { page } }) => {
  await page.evaluate(async () => {
    (window as unknown as WithGlobals).testState = new (window as unknown as WithGlobals).Logic.Recognizeable<'(min-width: 900px)', any>(
        [],
        {
          effects: defineEffect => [
            defineEffect('(min-width: 900px)', ({ recognized }) => recognized())
          ]
        }
      )
  
    const target = window.matchMedia('(min-width: 900px)')

    target.addEventListener('change', event => (window as unknown as WithGlobals).testState.recognize(event))
  })
  
  // Puppeteer viewport defaults to 800x600
  await page.setViewport({ width: 901, height: 600 })

  const value = await page.evaluate(() => {
          return new Promise(resolve => {
            setTimeout(() => resolve((window as unknown as WithGlobals).testState.status), 20)
          })
        }),
        expected = 'recognized'

  assert.is(value, expected)
})

suite(`correctly routes IdleDeadline`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new (window as unknown as WithGlobals).Logic.Recognizeable<'idle', any>(
                  [],
                  {
                    effects: defineEffect => [
                      defineEffect('idle', ({ recognized }) => recognized())
                    ]
                  }
                )

          instance.recognize({ didTimeout: true, timeRemaining: () => 0 })
                
          return instance.status
        }),
        expected = 'recognized'

  assert.is(value, expected)
})

suite(`correctly routes leftclickcombo`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new (window as unknown as WithGlobals).Logic.Recognizeable<'shift+click', any>(
                  [],
                  {
                    effectsIncludeCombos: true,
                    effects: defineEffect => [
                      defineEffect('shift+click', ({ recognized }) => recognized())
                    ]
                  }
                )

          instance.recognize(new MouseEvent('click', { shiftKey: true }))
                
          return instance.status
        }),
        expected = 'recognized'

  assert.is(value, expected)
})

suite(`correctly routes rightclickcombo`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new (window as unknown as WithGlobals).Logic.Recognizeable<'rightclick', any>(
                  [],
                  {
                    effectsIncludeCombos: true,
                    effects: defineEffect => [
                      defineEffect('rightclick', ({ recognized }) => recognized())
                    ]
                  }
                )

          instance.recognize(new MouseEvent('contextmenu'))
                
          return instance.status
        }),
        expected = 'recognized'

  assert.is(value, expected)
})

suite(`correctly routes keycombo`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new (window as unknown as WithGlobals).Logic.Recognizeable<'shift+a', any>(
                  [],
                  {
                    effectsIncludeCombos: true,
                    effects: defineEffect => [
                      defineEffect('shift+a', ({ recognized }) => recognized())
                    ]
                  }
                )

          instance.recognize(new KeyboardEvent('keydown', { key: 'A', shiftKey: true }))
                
          return instance.status
        }),
        expected = 'recognized'

  assert.is(value, expected)
})

suite(`correctly routes events`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new (window as unknown as WithGlobals).Logic.Recognizeable<'visibilitychange', any>(
                  [],
                  {
                    effects: defineEffect => [
                      defineEffect('visibilitychange', ({ recognized }) => recognized())
                    ]
                  }
                )

          instance.recognize(new Event('visibilitychange'))
                
          return instance.status
        }),
        expected = 'recognized'

  assert.is(value, expected)
})

suite(`includes all desired keys in effect API`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          let keys

          const instance = new (window as unknown as WithGlobals).Logic.Recognizeable<'visibilitychange', any>(
                  [],
                  {
                    effects: defineEffect => [
                      defineEffect('visibilitychange', api => keys = Object.keys(api))
                    ]
                  }
                )

          instance.recognize(new Event('visibilitychange'))
                
          return keys
        }),
        expected = [
          'getStatus',
          'getMetadata',
          'setMetadata',
          'recognized',
          'denied',
          'sequenceItem',
          'getSequence',
          'onRecognized',
        ]

  assert.equal(value, expected)
})

suite.run()
