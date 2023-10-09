import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'
import type {
  KeychordType,
  KeychordMetadata,
} from '../../src/factories'

const suite = withPlaywright(
  createSuite('createKeychord')
)

suite('recognizes keychords', async ({ playwright: { page, reloadNext } }) => {
  await page.evaluate(async () => {
    const listenable = new window.Logic.Listenable<KeychordType, KeychordMetadata>(
      'recognizeable' as KeychordType,
      { recognizeable: { effects: window.Logic.createKeychord('p o o p') } }
    )

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

suite('denies after max interval is exceeded', async ({ playwright: { page, reloadNext } }) => {
  await page.evaluate(async () => {
    const listenable = new window.Logic.Listenable<KeychordType, KeychordMetadata>(
      'recognizeable' as KeychordType,
      { recognizeable: { effects: window.Logic.createKeychord('p o o p', { maxInterval: 10 }) } }
    )

    window.testState = { listenable: listenable.listen(() => {}) }
  })

  await page.keyboard.press('P')
  await page.keyboard.press('O')
  await page.waitForTimeout(100)
  await page.keyboard.press('O')
  
  const value = await page.evaluate(() => window.testState.listenable.recognizeable.status),
        expected = 'denied'

  assert.is(value, expected)

  reloadNext()
})

suite('recognizes keychords with modifier held down', async ({ playwright: { page, reloadNext } }) => {
  await page.evaluate(async () => {
    const listenable = new window.Logic.Listenable<KeychordType, KeychordMetadata>(
      'recognizeable' as KeychordType,
      { recognizeable: { effects: window.Logic.createKeychord('alt+p alt+o alt+o alt+p') } }
    )

    window.testState = { listenable: listenable.listen(() => {}) }
  })

  await page.keyboard.down('Alt')
  await page.keyboard.press('P')
  await page.keyboard.press('O')
  await page.keyboard.press('O')
  await page.keyboard.press('P')
  
  const value = await page.evaluate(() => window.testState.listenable.recognizeable.status),
        expected = 'recognized'

  assert.is(value, expected)

  reloadNext()
})

suite('recognizes keychords with modifier released', async ({ playwright: { page, reloadNext } }) => {
  await page.evaluate(async () => {
    const listenable = new window.Logic.Listenable<KeychordType, KeychordMetadata>(
      'recognizeable' as KeychordType,
      { recognizeable: { effects: window.Logic.createKeychord('alt+p alt+o alt+o alt+p') } }
    )

    window.testState = { listenable: listenable.listen(() => {}) }
  })

  await page.keyboard.down('Alt')
  await page.keyboard.press('P')
  await page.keyboard.up('Alt')
  await page.keyboard.down('Alt')
  await page.keyboard.press('O')
  await page.keyboard.up('Alt')
  await page.keyboard.down('Alt')
  await page.keyboard.press('O')
  await page.keyboard.up('Alt')
  await page.keyboard.down('Alt')
  await page.keyboard.press('P')
  
  const value = await page.evaluate(() => window.testState.listenable.recognizeable.status),
        expected = 'recognized'

  assert.is(value, expected)

  reloadNext()
})

suite('stores played chord', async ({ playwright: { page, reloadNext } }) => {
  await page.evaluate(async () => {
    const listenable = new window.Logic.Listenable<KeychordType, KeychordMetadata>(
      'recognizeable' as KeychordType,
      { recognizeable: { effects: window.Logic.createKeychord('p o o p') } }
    )

    window.testState = { listenable: listenable.listen(() => {}) }
  })

  await page.keyboard.press('P')
  await page.keyboard.press('O')
  await page.keyboard.press('O')
  await page.keyboard.press('P')
  
  const value = await page.evaluate(() => window.testState.listenable.recognizeable.metadata.played.map(({ keycombo }) => keycombo)),
        expected = ['p', 'o', 'o', 'p']        

  assert.equal(value, expected)

  reloadNext()
})


suite.run()
