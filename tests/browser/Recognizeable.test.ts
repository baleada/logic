import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import type { WithLogic } from '../fixtures/types'

type Context = {
  shouldReload: boolean,
}

const suite = withPuppeteer(
  createSuite<Context>('Recognizeable (browser)')
)

suite.before(context => {
  context.shouldReload = true
})

suite.before.each(async ({ shouldReload, puppeteer: { page } }) => {
  if (shouldReload) await page.goto('http://localhost:3000')
})

suite(`stores the sequence`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
    return new (window as unknown as WithLogic).Logic.Recognizeable([]).sequence
  })

  assert.equal(value, [])
})

suite(`assignment sets the sequence`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
    const instance = new (window as unknown as WithLogic).Logic.Recognizeable<MouseEvent>([])
    instance.sequence = [new MouseEvent('click')]
    return instance.sequence.length
  })

  assert.is(value, 1)
})

suite(`setSequence sets the sequence`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
    const instance = new (window as unknown as WithLogic).Logic.Recognizeable<MouseEvent>([])
    instance.setSequence([new MouseEvent('click')])
    return instance.sequence.length
  })

  assert.is(value, 1)
})

suite(`first recognize(event) sets status to recognizing`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
    const instance = new (window as unknown as WithLogic).Logic.Recognizeable<MouseEvent>([])
    instance.recognize(new MouseEvent('click'))
    return instance.status
  })

  assert.is(value, 'recognizing')
})

suite(`recognize(event) calls handler`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
    let handlerWasCalled = false
    
    const instance = new (window as unknown as WithLogic).Logic.Recognizeable<MouseEvent>(
      [],
      {
        handlers: {
          'click': () => handlerWasCalled = true
        }
      }
    )
    
    instance.recognize(new MouseEvent('click'))
    
    
    return handlerWasCalled
  })

  assert.is(value, true)
})

suite(`handler API recognized() sets status`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
    const instance = new (window as unknown as WithLogic).Logic.Recognizeable<MouseEvent>(
      [],
      {
        handlers: {
          'click': ({ recognized }) => recognized()
        }
      }
    )
    
    instance.recognize(new MouseEvent('click'))
    
    
    return instance.status
  })

  assert.is(value, 'recognized')
})

suite(`handler API denied() sets status`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
    const instance = new (window as unknown as WithLogic).Logic.Recognizeable<MouseEvent>(
      [],
      {
        handlers: {
          'click': ({ denied }) => denied()
        }
      }
    )
    
    instance.recognize(new MouseEvent('click'))
    
    
    return instance.status
  })

  assert.is(value, 'denied')
})

suite(`handler API getSequence() gets the new sequence`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
    let sequence

    const instance = new (window as unknown as WithLogic).Logic.Recognizeable<MouseEvent>(
      [],
      {
        handlers: {
          'click': ({ getSequence }) => sequence = getSequence()
        }
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

suite(`handler API getStatus() gets status`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
    let status

    const instance = new (window as unknown as WithLogic).Logic.Recognizeable<MouseEvent>(
      [],
      {
        handlers: {
          'click': ({ getStatus }) => status = getStatus()
        }
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

suite(`handler API getMetadata() gets metadata`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
    let metadata

    const instance = new (window as unknown as WithLogic).Logic.Recognizeable<MouseEvent>(
      [],
      {
        handlers: {
          'click': ({ getMetadata }) => metadata = getMetadata()
        }
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

suite(`handler API's getMetadata() is a reference to metadata`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
    let metadata

    const instance = new (window as unknown as WithLogic).Logic.Recognizeable<MouseEvent>(
      [],
      {
        handlers: {
          'click': ({ getMetadata }) => metadata = getMetadata()
        }
      }
    )
    
    instance.recognize(new MouseEvent('click'))

    metadata.stub = 'stub'
    
    return {
      fromInstance: JSON.stringify(instance.metadata),
      fromApi: JSON.stringify(metadata),
    }
  })

  assert.is(value.fromInstance, value.fromApi)
})

suite(`handler API setMetadata() sets metadata`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
    const instance = new (window as unknown as WithLogic).Logic.Recognizeable<MouseEvent>(
      [],
      {
        handlers: {
          'click': ({ setMetadata }) => setMetadata({ stub: 'stub' })
        }
      }
    )
    
    instance.recognize(new MouseEvent('click'))
    
    return instance.metadata
  })

  assert.equal(value, { stub: 'stub' })
})

/* status */
suite(`status is 'ready' after construction`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
    return new (window as unknown as WithLogic).Logic.Recognizeable([]).status
  })

  assert.is(value, 'ready')
})

suite(`status is 'recognizing' after recognize(...) is called at least once and handlers did not call recognized or denied`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
    return new (window as unknown as WithLogic).Logic.Recognizeable<MouseEvent>([])
      .recognize(new MouseEvent('click'))
      .status
  })

  assert.is(value, 'recognizing')
})

suite(`correctly routes IntersectionObserverEntry[]`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const instance = new (window as unknown as WithLogic).Logic.Recognizeable<IntersectionObserverEntry[]>(
                  [],
                  {
                    handlers: {
                      intersect: ({ recognized }) => recognized()
                    }
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
          const instance = new (window as unknown as WithLogic).Logic.Recognizeable<MutationRecord[]>(
                  [],
                  {
                    handlers: {
                      mutate: ({ recognized }) => recognized()
                    }
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
          const instance = new (window as unknown as WithLogic).Logic.Recognizeable<ResizeObserverEntry[]>(
                  [],
                  {
                    handlers: {
                      resize: ({ recognized }) => recognized()
                    }
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

suite.only(`correctly routes MediaQueryListEvent`, async ({ puppeteer: { page } }) => {
  await page.evaluate(async () => {
    (window as unknown as WithLogic).testState = new (window as unknown as WithLogic).Logic.Recognizeable<MediaQueryListEvent>(
        [],
        {
          handlers: {
            '(min-width: 900px)': ({ recognized }) => recognized()
          }
        }
      )
  
    const target = window.matchMedia('(min-width: 900px)')

    target.addEventListener('change', event => (window as unknown as WithLogic).testState.recognize(event))
  })
  
  // Puppeteer viewport defaults to 800x600
  await page.setViewport({ width: 901, height: 600 })

  const value = await page.evaluate(() => {
          return new Promise(resolve => {
            setTimeout(() => resolve((window as unknown as WithLogic).testState.status), 20)
          })
        }),
        expected = 'recognized'

  assert.is(value, expected)
})

// detects
// - idle
// - leftclickcombo
// - rightclickcombo
// - keycombo
// - event


suite.run()
