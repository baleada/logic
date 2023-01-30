import { withPuppeteer } from '@baleada/prepare'
import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { WithGlobals } from '../fixtures/types'

const suite = withPuppeteer(
  createSuite('createExceptAndOnlyEffect')
)

suite.before(context => {
  context.eventStub = {
    target: { matches: selector => selector === 'stub' }
  }
})

suite(`doesn't guard when except and only are empty`, async ({ puppeteer: { page } }) => {
  await page.evaluate(() => {
    window.testState = { value: 0 };

    window.testState.effect = window.Logic_extracted.createExceptAndOnlyEffect(
      'click',
      () => window.testState.value++,
      {}
    )

    document.body.addEventListener('click', window.testState.effect)
  })

  await page.click('body')

  const value = await page.evaluate(() => {
    document.body.removeEventListener('click', window.testState.effect)
    return window.testState.value
  })
  
  assert.is(value, 1)
})

suite(`guards against except when only is empty`, async ({ puppeteer: { page } }) => {
  await page.evaluate(() => {
    window.testState = { value: 0 };

    window.testState.effect = window.Logic_extracted.createExceptAndOnlyEffect(
      'click',
      () => window.testState.value++,
      { except: ['body'] }
    )

    document.body.addEventListener('click', window.testState.effect)
  })

  await page.click('body')

  const value = await page.evaluate(() => {
    document.body.removeEventListener('click', window.testState.effect)
    return window.testState.value
  })
  
  assert.is(value, 0)
})

suite(`overrides except with only`, async ({ puppeteer: { page } }) => {
  await page.evaluate(() => {
    window.testState = { value: 0 };

    window.testState.effect = window.Logic_extracted.createExceptAndOnlyEffect(
      'click',
      () => window.testState.value++,
      { only: ['body'], except: ['body'] }
    )

    document.body.addEventListener('click', window.testState.effect)
  })

  await page.click('body')

  const value = await page.evaluate(() => {
    document.body.removeEventListener('click', window.testState.effect)
    return window.testState.value
  })
  
  assert.is(value, 1)
})

suite(`guards against mismatches with only`, async ({ puppeteer: { page } }) => {
  await page.evaluate(() => {
    window.testState = { value: 0 };

    window.testState.effect = window.Logic_extracted.createExceptAndOnlyEffect(
      'click',
      () => window.testState.value++,
      { only: ['.stub'] }
    )

    document.body.addEventListener('click', window.testState.effect)
  })

  await page.click('body')

  const value = await page.evaluate(() => {
    document.body.removeEventListener('click', window.testState.effect)
    return window.testState.value
  })
  
  assert.is(value, 0)
})

suite.run()
