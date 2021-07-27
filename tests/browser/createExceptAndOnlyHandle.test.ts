import { withPuppeteer } from '@baleada/prepare'
import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { WithLogic } from '../fixtures/types'

const suite = withPuppeteer(
  createSuite('createExceptAndOnlyHandle')
)

suite.before(context => {
  context.eventStub = {
    target: { matches: selector => selector === 'stub' }
  }
})

suite(`doesn't guard when except and only are empty`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
    let value = 0;

    const handle = (window as unknown as WithLogic).Logic_extracted.createExceptAndOnlyHandle<MouseEvent>(
      () => value++,
      {}
    )

    document.body.addEventListener('click', handle)

    const click = new (window as unknown as WithLogic).Logic.Dispatchable<MouseEvent>('click')
    click.dispatch({ target: document.body })

    document.body.removeEventListener('click', handle)

    return value
  })
  
  assert.is(value, 1)
})

suite(`guards against except when only is empty`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
    let value = 0;

    const handle = (window as unknown as WithLogic).Logic_extracted.createExceptAndOnlyHandle<MouseEvent>(
      () => value++,
      { except: ['body'] }
    )

    document.body.addEventListener('click', handle)

    const click = new (window as unknown as WithLogic).Logic.Dispatchable<MouseEvent>('click')
    click.dispatch({ target: document.body })

    document.body.removeEventListener('click', handle)

    return value
  })
  
  assert.is(value, 0)
})

suite(`overrides except with only`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
    let value = 0;

    const handle = (window as unknown as WithLogic).Logic_extracted.createExceptAndOnlyHandle<MouseEvent>(
      () => value++,
      { only: ['body'], except: ['body'] }
    )

    document.body.addEventListener('click', handle)

    const click = new (window as unknown as WithLogic).Logic.Dispatchable<MouseEvent>('click')
    click.dispatch({ target: document.body })

    document.body.removeEventListener('click', handle)

    return value
  })
  
  assert.is(value, 1)
})

suite(`guards against mismatches with only`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
    let value = 0;

    const handle = (window as unknown as WithLogic).Logic_extracted.createExceptAndOnlyHandle<MouseEvent>(
      () => value++,
      { only: ['.stub'] }
    )

    document.body.addEventListener('click', handle)

    const click = new (window as unknown as WithLogic).Logic.Dispatchable<MouseEvent>('click')
    click.dispatch({ target: document.body })

    document.body.removeEventListener('click', handle)

    return value
  })
  
  assert.is(value, 0)
})

suite.run()
