import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'
import type {
  KeypressTypes,
  KeypressMetadata,
  KeypressOptions,
  KeypressHook,
  KeypressHookApi
} from '../../src/factories/recognizeable-effects'
import type { Listenable } from '../../src/classes/Listenable'

const suite = withPlaywright(
  createSuite('createKeypress')
)

suite(`recognizes keypress`, async ({ playwright: { page, reloadNext } }) => {
  await page.evaluate(async () => {
    const listenable = new window.Logic.Listenable<KeypressTypes, KeypressMetadata>(
      'recognizeable' as KeypressTypes, 
      { recognizeable: { effects: window.Logic.createKeypress('A') } }
    );

    window.testState = { listenable: listenable.listen(() => {}) }
  })

  await page.keyboard.down('A')
  await page.waitForTimeout(20)
  
  const value = await page.evaluate(() => (window.testState.listenable as Listenable<KeypressTypes, KeypressMetadata>).recognizeable.status),
        expected = 'recognized'

  assert.is(value, expected)

  reloadNext()
})

suite(`respects minDuration option`, async ({ playwright: { page, reloadNext } }) => {
  await page.evaluate(async () => {
    const listenable = new window.Logic.Listenable<KeypressTypes, KeypressMetadata>(
      'recognizeable' as KeypressTypes, 
      { recognizeable: { effects: window.Logic.createKeypress('A', { minDuration: 100 }) } }
    );

    window.testState = { listenable: listenable.listen(() => {}) }
  })

  await page.keyboard.down('A')
  await page.waitForTimeout(50)
  
  const recognizing = await page.evaluate(() => (window.testState.listenable as Listenable<KeypressTypes, KeypressMetadata>).recognizeable.status)  
  assert.is(recognizing, 'recognizing')

  await page.waitForTimeout(150)
  const recognized = await page.evaluate(() => (window.testState.listenable as Listenable<KeypressTypes, KeypressMetadata>).recognizeable.status)
  assert.is(recognized, 'recognized')

  reloadNext()
})

suite(`recognizes arrays of keycombos`, async ({ playwright: { page, reloadNext } }) => {
  await page.evaluate(async () => {
    const listenable = new window.Logic.Listenable<KeypressTypes, KeypressMetadata>(
      'recognizeable' as KeypressTypes, 
      { recognizeable: { effects: window.Logic.createKeypress(['A', 'B']) } }
    );

    window.testState = { listenable: listenable.listen(() => {}) }
  })

  for (const key of ['A', 'B']) {
    await page.keyboard.down(key)
    await page.waitForTimeout(20)
    
    const value = await page.evaluate(() => (window.testState.listenable as Listenable<KeypressTypes, KeypressMetadata>).recognizeable.status),
          expected = 'recognized'
  
    assert.is(value, expected)
  }

  await page.keyboard.down('C')
  await page.waitForTimeout(20)
  
  const value = await page.evaluate(() => (window.testState.listenable as Listenable<KeypressTypes, KeypressMetadata>).recognizeable.status),
        expected = 'denied'

  assert.is(value, expected)


  reloadNext()
})

suite(`doesn't deny on up if keycombo still matches`, async ({ playwright: { page, reloadNext } }) => {
  await page.evaluate(async () => {
    const listenable = new window.Logic.Listenable<KeypressTypes, KeypressMetadata>(
      'recognizeable' as KeypressTypes, 
      { recognizeable: { effects: window.Logic.createKeypress(['A', 'B']) } }
    );

    window.testState = { listenable: listenable.listen(() => {}) }
  })

  await page.keyboard.down('A')
  await page.waitForTimeout(20)
  await page.keyboard.down('B')
  await page.waitForTimeout(20)

  const one = await page.evaluate(() => (window.testState.listenable as Listenable<KeypressTypes, KeypressMetadata>).recognizeable.status),
        expected = 'recognized'

  assert.is(one, expected)

  await page.keyboard.up('B')
  await page.waitForTimeout(20)

  const two = await page.evaluate(() => (window.testState.listenable as Listenable<KeypressTypes, KeypressMetadata>).recognizeable.status),
        expectedTwo = 'recognized'

  assert.is(two, expectedTwo)

  await page.keyboard.up('A')
  await page.waitForTimeout(20)

  const three = await page.evaluate(() => (window.testState.listenable as Listenable<KeypressTypes, KeypressMetadata>).recognizeable.status),
        expectedThree = 'denied'

  assert.is(three, expectedThree)

  reloadNext()
})

suite(`denies on up if keycombo no longer matches`, async ({ playwright: { page, reloadNext } }) => {
  await page.evaluate(async () => {
    const listenable = new window.Logic.Listenable<KeypressTypes, KeypressMetadata>(
      'recognizeable' as KeypressTypes, 
      { recognizeable: { effects: window.Logic.createKeypress('shift+A') } }
    );

    window.testState = { listenable: listenable.listen(() => {}) }
  })

  await page.keyboard.down('Shift')
  await page.waitForTimeout(20)
  await page.keyboard.down('A')
  await page.waitForTimeout(20)

  const one = await page.evaluate(() => (window.testState.listenable as Listenable<KeypressTypes, KeypressMetadata>).recognizeable.status),
        expected = 'recognized'

  assert.is(one, expected)

  await page.keyboard.up('Shift')
  await page.waitForTimeout(20)

  const two = await page.evaluate(() => (window.testState.listenable as Listenable<KeypressTypes, KeypressMetadata>).recognizeable.status),
        expectedTwo = 'denied'

  assert.is(two, expectedTwo)

  reloadNext()
})

suite(`lists pressed keycombos`, async ({ playwright: { page, reloadNext } }) => {
  await page.evaluate(async () => {
    const listenable = new window.Logic.Listenable<KeypressTypes, KeypressMetadata>(
      'recognizeable' as KeypressTypes, 
      { recognizeable: { effects: window.Logic.createKeypress(['A', 'B']) } }
    );

    window.testState = { listenable: listenable.listen(() => {}) }
  })

  for (const key of ['A', 'B']) {
    await page.keyboard.down(key)
    await page.waitForTimeout(20)
  }
    
  const value = await page.evaluate(() => [...(window.testState.listenable as Listenable<KeypressTypes, KeypressMetadata>).recognizeable.metadata.pressed]),
        expected = ['A', 'B']

  assert.equal(value, expected)


  reloadNext()
})

suite.run()
