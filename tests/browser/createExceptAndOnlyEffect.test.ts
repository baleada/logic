import { withPlaywright } from '@baleada/prepare'
import { withPlaywrightOptions } from '../fixtures/withPlaywrightOptions'
import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'

const suite = withPlaywright(
  createSuite('createExceptAndOnlyEffect'),
  withPlaywrightOptions
)

suite.before(context => {
  context.eventStub = {
    target: { matches: selector => selector === 'stub' },
  }
})

suite('doesn\'t guard when except and only are empty', async ({ playwright: { page } }) => {
  await page.evaluate(() => {
    window.testState = { value: 0 }

    window.testState.effect = window.Logic.createExceptAndOnlyEffect(
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

suite('doesn\'t guard for non-element targets when except and only are empty', async ({ playwright: { page } }) => {
  await page.evaluate(() => {
    window.testState = { value: 0 }

    window.testState.effect = window.Logic.createExceptAndOnlyEffect(
      'click',
      () => window.testState.value++,
      {}
    )

    document.addEventListener('click', window.testState.effect)
  })

  await page.click('body')

  const value = await page.evaluate(() => {
    document.removeEventListener('click', window.testState.effect)
    return window.testState.value
  })

  assert.is(value, 1)
})

suite('guards against except when only is empty', async ({ playwright: { page } }) => {
  await page.evaluate(() => {
    window.testState = { value: 0 }

    window.testState.effect = window.Logic.createExceptAndOnlyEffect(
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

suite('overrides except with only', async ({ playwright: { page } }) => {
  await page.evaluate(() => {
    window.testState = { value: 0 }

    window.testState.effect = window.Logic.createExceptAndOnlyEffect(
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

suite('guards against mismatches with only', async ({ playwright: { page } }) => {
  await page.evaluate(() => {
    window.testState = { value: 0 }

    window.testState.effect = window.Logic.createExceptAndOnlyEffect(
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
