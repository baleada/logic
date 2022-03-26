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
    (window as unknown as WithGlobals).testState = { value: 0 };

    ;(window as unknown as WithGlobals).testState.effect = (window as unknown as WithGlobals).Logic_extracted.createExceptAndOnlyEffect(
      'click',
      () => (window as unknown as WithGlobals).testState.value++,
      {}
    )

    document.body.addEventListener('click', (window as unknown as WithGlobals).testState.effect)
  })

  await page.click('body')

  const value = await page.evaluate(() => {
    document.body.removeEventListener('click', (window as unknown as WithGlobals).testState.effect)
    return (window as unknown as WithGlobals).testState.value
  })
  
  assert.is(value, 1)
})

suite(`guards against except when only is empty`, async ({ puppeteer: { page } }) => {
  await page.evaluate(() => {
    (window as unknown as WithGlobals).testState = { value: 0 };

    ;(window as unknown as WithGlobals).testState.effect = (window as unknown as WithGlobals).Logic_extracted.createExceptAndOnlyEffect(
      'click',
      () => (window as unknown as WithGlobals).testState.value++,
      { except: ['body'] }
    )

    document.body.addEventListener('click', (window as unknown as WithGlobals).testState.effect)
  })

  await page.click('body')

  const value = await page.evaluate(() => {
    document.body.removeEventListener('click', (window as unknown as WithGlobals).testState.effect)
    return (window as unknown as WithGlobals).testState.value
  })
  
  assert.is(value, 0)
})

suite(`overrides except with only`, async ({ puppeteer: { page } }) => {
  await page.evaluate(() => {
    (window as unknown as WithGlobals).testState = { value: 0 };

    ;(window as unknown as WithGlobals).testState.effect = (window as unknown as WithGlobals).Logic_extracted.createExceptAndOnlyEffect(
      'click',
      () => (window as unknown as WithGlobals).testState.value++,
      { only: ['body'], except: ['body'] }
    )

    document.body.addEventListener('click', (window as unknown as WithGlobals).testState.effect)
  })

  await page.click('body')

  const value = await page.evaluate(() => {
    document.body.removeEventListener('click', (window as unknown as WithGlobals).testState.effect)
    return (window as unknown as WithGlobals).testState.value
  })
  
  assert.is(value, 1)
})

suite(`guards against mismatches with only`, async ({ puppeteer: { page } }) => {
  await page.evaluate(() => {
    (window as unknown as WithGlobals).testState = { value: 0 };

    ;(window as unknown as WithGlobals).testState.effect = (window as unknown as WithGlobals).Logic_extracted.createExceptAndOnlyEffect(
      'click',
      () => (window as unknown as WithGlobals).testState.value++,
      { only: ['.stub'] }
    )

    document.body.addEventListener('click', (window as unknown as WithGlobals).testState.effect)
  })

  await page.click('body')

  const value = await page.evaluate(() => {
    document.body.removeEventListener('click', (window as unknown as WithGlobals).testState.effect)
    return (window as unknown as WithGlobals).testState.value
  })
  
  assert.is(value, 0)
})

suite.run()
