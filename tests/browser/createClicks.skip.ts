import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'
import type {
  ClicksTypes,
  ClicksMetadata,
  ClicksOptions,
  ClicksHook,
  ClicksHookApi
} from '../../src/factories/recognizeable-effects'
import type { Listenable } from '../../src/classes/Listenable'

const suite = withPlaywright(
  createSuite('createClicks')
)

suite(`recognizes clicks`, async ({ playwright: { page, reloadNext } }) => {
  await page.evaluate(async () => {
    const listenable = new window.Logic.Listenable<ClicksTypes, ClicksMetadata>(
      'recognizeable' as ClicksTypes, 
      { recognizeable: { effects: window.Logic.createClicks() } }
    );

    window.testState = { listenable: listenable.listen(() => {}) }
  })

  await page.mouse.down()
  await page.mouse.up()
  
  const value = await page.evaluate(() => (window.testState.listenable as Listenable<ClicksTypes, ClicksMetadata>).recognizeable.status),
        expected = 'recognized'

  assert.is(value, expected)

  reloadNext()
})

suite.run()
