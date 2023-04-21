import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'
import type {
  KeychordTypes,
  KeychordMetadata,
  KeychordOptions,
  KeychordHook,
  KeychordHookApi
} from '../../src/factories/recognizeable-effects'

const suite = withPlaywright(
  createSuite('createKeychord')
)

suite(`recognizes keychords`, async ({ playwright: { page, reloadNext } }) => {
  await page.evaluate(async () => {
    const listenable = new window.Logic.Listenable<KeychordTypes, KeychordMetadata>(
      'recognizeable' as KeychordTypes,
      { recognizeable: { effects: window.Logic.createKeychord('p o o p') } }
    );

    window.testState = { listenable: listenable.listen(() => {}) }
  })

  await page.keyboard.press('P')
  await page.keyboard.press('O')
  await page.keyboard.press('O')
  await page.keyboard.press('P')
  
  const value = await page.evaluate(() => window.testState.listenable.recognizeable.status),
        expected = 'recognized'

  assert.is(value, expected)

  reloadNext()
})

suite(`starts over from beginning after max interval is exceeded`, async ({ playwright: { page, reloadNext } }) => {
  await page.evaluate(async () => {
    const listenable = new window.Logic.Listenable<KeychordTypes, KeychordMetadata>(
      'recognizeable' as KeychordTypes,
      { recognizeable: { effects: window.Logic.createKeychord('p o o p', { maxInterval: 100 }) } }
    );

    window.testState = { listenable: listenable.listen(() => {}) }
  })

  await page.keyboard.press('P')
  await page.keyboard.press('O')
  await page.keyboard.press('O')
  await page.waitForTimeout(500)
  await page.keyboard.press('P')
  
  const value = await page.evaluate(() => window.testState.listenable.recognizeable.status),
        expected = 'recognizing'

  assert.is(value, expected)

  reloadNext()
})


suite.run()
