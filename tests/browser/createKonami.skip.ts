import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'
import type {
  KonamiType,
  KonamiMetadata,
  KonamiOptions,
  KonamiHook,
  KonamiHookApi
} from '../../src/factories/recognizeable-effects'

const suite = withPlaywright(
  createSuite('createKonami')
)

suite(`recognizes Konami code`, async ({ playwright: { page, reloadNext } }) => {
  await page.evaluate(async () => {
    const listenable = new window.Logic.Listenable<KonamiType, KonamiMetadata>(
      'recognizeable' as KonamiType, 
      { recognizeable: { effects: window.Logic.createKonami() } }
    );

    window.testState = { listenable: listenable.listen(() => {}) }
  })

  await page.keyboard.press('ArrowUp')
  await page.keyboard.press('ArrowUp')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('ArrowLeft')
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowLeft')
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('B')
  await page.keyboard.press('A')
  await page.keyboard.press('Enter')
  
  const value = await page.evaluate(() => window.testState.listenable.recognizeable.status),
        expected = 'recognized'

  assert.is(value, expected)

  reloadNext()
})


suite.run()
