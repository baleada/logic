import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import type { WithLogic } from '../fixtures/types'

type Context = {
  shouldReload: boolean,
}

const suite = withPuppeteer(
  createSuite<Context>('Recognizeable (browser)'),
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
          'click': () => (handlerWasCalled = true)
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

suite.run()
