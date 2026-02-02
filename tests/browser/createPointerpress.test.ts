import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'
import { withPlaywrightOptions } from '../fixtures/withPlaywrightOptions'
import type {
  PointerpressType,
  PointerpressMetadata,
} from '../../src/factories'
import type { Listenable } from '../../src/classes/Listenable'

const suite = withPlaywright(
  createSuite('createterPointerpress'),
  withPlaywrightOptions
)

suite('recognizes pointerpress', async ({ playwright: { page, reloadNext } }) => {
  await page.evaluate(async () => {
    const listenable = new window.Logic.Listenable<PointerpressType, PointerpressMetadata>(
      'recognizeable' as PointerpressType,
      { recognizeable: { effects: window.Logic.createPointerpress() } }
    )

    window.testState = { listenable: listenable.listen(() => {}) }
  })

  await page.mouse.down()
  await page.waitForTimeout(10)

  const value = await page.evaluate(() => (window.testState.listenable as Listenable<PointerpressType, PointerpressMetadata>).recognizeable.status),
        expected = 'recognized'

  assert.is(value, expected)

  reloadNext()
})

suite('respects minDuration option', async ({ playwright: { page, reloadNext } }) => {
  await page.evaluate(async () => {
    const listenable = new window.Logic.Listenable<PointerpressType, PointerpressMetadata>(
      'recognizeable' as PointerpressType,
      { recognizeable: { effects: window.Logic.createPointerpress({ minDuration: 100 }) } }
    )

    window.testState = { listenable: listenable.listen(() => {}) }
  })

  await page.mouse.down()
  await page.waitForTimeout(50)

  const recognizing = await page.evaluate(() => (window.testState.listenable as Listenable<PointerpressType, PointerpressMetadata>).recognizeable.status)
  assert.is(recognizing, 'recognizing')

  await page.waitForTimeout(100)
  const recognized = await page.evaluate(() => (window.testState.listenable as Listenable<PointerpressType, PointerpressMetadata>).recognizeable.status)
  assert.is(recognized, 'recognized')

  reloadNext()
})

suite('respects minDistance option', async ({ playwright: { page, reloadNext } }) => {
  await page.evaluate(async () => {
    const listenable = new window.Logic.Listenable<PointerpressType, PointerpressMetadata>(
      'recognizeable' as PointerpressType,
      { recognizeable: { effects: window.Logic.createPointerpress({ minDistance: 101 }) } }
    )

    window.testState = { listenable: listenable.listen(() => {}) }
  })

  await page.mouse.down()
  await page.mouse.move(0, 100)

  const from = await page.evaluate(() => window.testState.listenable.recognizeable.status)
  assert.is(from, 'recognizing')

  await page.mouse.up()
  await page.mouse.down()
  await page.mouse.move(0, 201)

  const to = await page.evaluate(() => window.testState.listenable.recognizeable.status)
  assert.is(to, 'recognized')

  reloadNext()
})

suite('calls hooks', async ({ playwright: { page, reloadNext } }) => {
  await page.evaluate(async () => {
    window.testState = {
      hooks: {
        onDown: false,
        onMove: false,
        onUp: false,
      },
    }

    const listenable = new window.Logic.Listenable<PointerpressType, PointerpressMetadata>(
      'recognizeable' as PointerpressType,
      {
        recognizeable: {
          effects: window.Logic.createPointerpress({
            onDown: () => window.testState.hooks.onDown = true,
            onMove: () => window.testState.hooks.onMove = true,
            onUp: () => window.testState.hooks.onUp = true,
          }),
        },
      }
    )

    listenable.listen(() => {})
  })

  await page.mouse.down()
  await page.mouse.move(0, 100)
  await page.mouse.up()

  const value = await page.evaluate(() => window.testState.hooks),
        expected = { onDown: true, onMove: true, onUp: true }

  assert.equal(value, expected)

  reloadNext()
})

suite('doesn\'t listen for pointermove before pointerdown', async ({ playwright: { page, reloadNext } }) => {
  await page.evaluate(async () => {
    window.testState = {
      hooks: {
        onMove: false,
      },
    }

    const listenable = new window.Logic.Listenable<PointerpressType, PointerpressMetadata>(
      'recognizeable' as PointerpressType,
      {
        recognizeable: {
          effects: window.Logic.createPointerpress({
            onMove: () => window.testState.hooks.onMove = true,
          }),
        },
      }
    )

    listenable.listen(() => {})
  })

  await page.mouse.move(0, 100)

  const value = await page.evaluate(() => window.testState.hooks),
        expected = { onMove: false }

  assert.equal(value, expected)

  reloadNext()
})

suite('doesn\'t listen for pointermove after pointerup', async ({ playwright: { page, reloadNext } }) => {
  await page.evaluate(async () => {
    window.testState = {
      hooks: {
        onMove: false,
        onUp: false,
      },
    }

    const listenable = new window.Logic.Listenable<PointerpressType, PointerpressMetadata>(
      'recognizeable' as PointerpressType,
      {
        recognizeable: {
          effects: window.Logic.createPointerpress({
            onMove: () => window.testState.hooks.onMove = window.testState.hooks.onUp && true,
            onUp: () => window.testState.hooks.onUp = true,
          }),
        },
      }
    )

    listenable.listen(() => {})
  })

  await page.mouse.down()
  await page.mouse.move(0, 100)
  await page.mouse.up()
  await page.mouse.move(0, 100)

  const value = await page.evaluate(() => window.testState.hooks),
        expected = { onMove: false, onUp: true }

  assert.equal(value, expected)

  reloadNext()
})

suite('adds pointermove to sequence', async ({ playwright: { page, reloadNext } }) => {
  await page.evaluate(async () => {
    const listenable = new window.Logic.Listenable<PointerpressType, PointerpressMetadata>(
      'recognizeable' as PointerpressType,
      { recognizeable: { effects: window.Logic.createPointerpress() } }
    )

    window.testState = { listenable: listenable.listen(() => {}) }
  })

  await page.mouse.down()
  await page.mouse.move(0, 100)

  const value = await page.evaluate(() => (window.testState.listenable as Listenable<PointerpressType, PointerpressMetadata>).recognizeable.sequence.at(-1).type),
        expected = 'pointermove'

  assert.is(value, expected)

  reloadNext()
})

suite.run()
