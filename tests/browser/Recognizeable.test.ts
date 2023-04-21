import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import type { WithGlobals } from '../fixtures/types'

const suite = withPuppeteer(
  createSuite('Recognizeable')
)

suite(`stores the sequence`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
    return new window.Logic.Recognizeable([]).sequence
  })

  assert.equal(value, [])
})

suite(`assignment sets the sequence`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
    const instance = new window.Logic.Recognizeable([])
    instance.sequence = [new MouseEvent('click')]
    return instance.sequence.length
  })

  assert.is(value, 1)
})

suite(`setSequence sets the sequence`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
    const instance = new window.Logic.Recognizeable([])
    instance.setSequence([new MouseEvent('click')])
    return instance.sequence.length
  })

  assert.is(value, 1)
})

suite(`first recognize(sequenceItem) sets status to recognizing`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
    const instance = new window.Logic.Recognizeable([])
    instance.recognize(new MouseEvent('click'), { is: () => false })
    return instance.status
  })

  assert.is(value, 'recognizing')
})

suite(`recognize(sequenceItem) calls effect`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
    let effectWasCalled = false
    
    const instance = new window.Logic.Recognizeable(
      [],
      {
        effects: {
          click: () => effectWasCalled = true,
          keydown: () => effectWasCalled = true,
        }
      }
    )
    
    instance.recognize(new MouseEvent('click'), { is: () => false })
    
    return effectWasCalled
  })

  assert.is(value, true)
})

suite(`effect API recognized() sets status`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
    const instance = new window.Logic.Recognizeable(
      [],
      {
        effects: {
          click: (event, { recognized }) => recognized(),
        }
      }
    )
    
    instance.recognize(new MouseEvent('click'), { is: () => false })
    
    
    return instance.status
  })

  assert.is(value, 'recognized')
})

suite(`effect API denied() sets status`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
    const instance = new window.Logic.Recognizeable(
      [],
      {
        effects: {
          click: (event, { denied }) => denied(),
        }
      }
    )
    
    instance.recognize(new MouseEvent('click'), { is: () => false })
    
    
    return instance.status
  })

  assert.is(value, 'denied')
})

suite(`effect API getSequence() gets the new sequence`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
    let sequence

    const instance = new window.Logic.Recognizeable(
      [],
      {
        effects: {
          click: (event, { getSequence }) => sequence = getSequence(),
        }
      }
    )
    
    instance.recognize(new MouseEvent('click'), { is: () => false })
    
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

    const instance = new window.Logic.Recognizeable(
      [],
      {
        effects: {
          click: (event, { getStatus }) => status = getStatus(),
        }
      }
    )
    
    instance.recognize(new MouseEvent('click'), { is: () => false })
    
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

    const instance = new window.Logic.Recognizeable(
      [],
      {
        effects: {
          click: (event, { getMetadata }) => metadata = getMetadata(),
        }
      }
    )
    
    instance.recognize(new MouseEvent('click'), { is: () => false })
    
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

    const instance = new window.Logic.Recognizeable(
      [],
      {
        effects: {
          click: (event, { getMetadata }) => metadata = getMetadata(),
        }
      }
    )
    
    instance.recognize(new MouseEvent('click'), { is: () => false })

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
    const instance = new window.Logic.Recognizeable(
      [],
      {
        effects: {
          click: (event, { setMetadata }) => setMetadata({ stub: 'stub' }),
        }
      }
    )
    
    instance.recognize(new MouseEvent('click'), { is: () => false })
    
    return instance.metadata
  })

  assert.equal(value, { stub: 'stub' })
})

suite(`effect API onRecognized() performs side effect`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
    let onRecognizedStatus = 'not performed'
    const onRecognized = () => onRecognizedStatus = 'performed'

    const instance = new window.Logic.Recognizeable(
      [],
      {
        effects: {
          click: (event, { onRecognized: o }) => o(event),
        }
      }
    )
    
    instance.recognize(new MouseEvent('click'), { is: () => false }, { onRecognized })
    
    return onRecognizedStatus
  })

  assert.equal(value, 'performed')
})

suite(`effect API sequenceItem accesses sequenceItem`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
    let result

    const instance = new window.Logic.Recognizeable(
      [],
      {
        effects: {
          click: (sequenceItem) => result = sequenceItem.type,
        }
      }
    )
    
    instance.recognize(new MouseEvent('click'), { is: () => false })
    
    return result
  })

  assert.equal(value, 'click')
})

/* status */
suite(`status is 'ready' after construction`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
    return new window.Logic.Recognizeable([]).status
  })

  assert.is(value, 'ready')
})

suite(`status is 'recognizing' after recognize(...) is called at least once and effects did not call recognized or denied`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
    return new window.Logic.Recognizeable([])
      .recognize(new MouseEvent('click'), { is: () => false })
      .status
  })

  assert.is(value, 'recognizing')
})

suite(`correctly routes IntersectionObserverEntry[]`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new window.Logic.Recognizeable(
                  [],
                  {
                    effects: {
                      intersect: (event, { recognized }) => recognized(),
                    }
                  }
                ),
                observer = new IntersectionObserver((...params) => {
                  instance.recognize(...params)
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
          const instance = new window.Logic.Recognizeable(
                  [],
                  {
                    effects: {
                      mutate: (event, { recognized }) => recognized(),
                    }
                  }
                ),
                observer = new MutationObserver((...params) => {
                  instance.recognize(...params)
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
          const instance = new window.Logic.Recognizeable(
                  [],
                  {
                    effects: {
                      resize: (event, { recognized }) => recognized(),
                    }
                  }
                ),
                observer = new ResizeObserver((...params) => {
                  instance.recognize(...params)
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
    window.testState = new window.Logic.Recognizeable(
        [],
        {
          effects: {
            '(min-width: 900px)': (event, { recognized }) => {
              console.log('here')
              recognized()
            },
          }
        }
      )
  
    const target = window.matchMedia('(min-width: 900px)')

    target.addEventListener('change', event => window.testState.recognize(event, {}))
  })
  
  await page.setViewport({ width: 1, height: 600 })
  await page.setViewport({ width: 901, height: 600 })

  const value = await page.evaluate(() => {
          return new Promise(resolve => {
            setTimeout(() => resolve(window.testState.status), 20)
          })
        }),
        expected = 'recognized'

  assert.is(value, expected)
})

suite(`correctly routes IdleDeadline`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new window.Logic.Recognizeable(
                  [],
                  {
                    effects: {
                      idle: (deadline, { recognized }) => recognized(),
                    }
                  }
                )

          instance.recognize({ didTimeout: true, timeRemaining: () => 0 }, {})
                
          return instance.status
        }),
        expected = 'recognized'

  assert.is(value, expected)
})

suite(`correctly routes events`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new window.Logic.Recognizeable(
                  [],
                  {
                    effects: {
                      visibilitychange: (event, { recognized }) => recognized(),
                    }
                  }
                )

          instance.recognize(new Event('visibilitychange'), {})
                
          return instance.status
        }),
        expected = 'recognized'

  assert.is(value, expected)
})

suite(`includes all desired keys in effect API`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          let keys

          const instance = new window.Logic.Recognizeable(
                  [],
                  {
                    effects: {
                      visibilitychange: (event, api) => keys = Object.keys(api),
                    }
                  }
                )

          instance.recognize(new Event('visibilitychange'), {})
                
          return keys
        }),
        expected = [
          'getStatus',
          'getMetadata',
          'setMetadata',
          'recognized',
          'denied',
          'getSequence',
          'onRecognized',
        ]

  assert.equal(value, expected)
})

suite.run()
