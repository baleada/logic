import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'
import { withPlaywrightOptions } from '../fixtures/withPlaywrightOptions'
import type {
  PointerhoverType,
  PointerhoverMetadata,
} from '../../src/factories'
import type { Listenable } from '../../src/classes/Listenable'

const suite = withPlaywright(
  createSuite('createPointerhover'),
  withPlaywrightOptions
)

suite.before.each(async ({ playwright: { page } }) => {
  await page.evaluate(() => {
    const el = document.createElement('div')

    el.id = 'el'
    el.style.margin = '20px'
    el.style.width = '20px'
    el.style.height = '20px'

    document.body.innerHTML = ''
    document.body.appendChild(el)
  })
})

suite('recognizes hover', async ({ playwright: { page, reloadNext } }) => {
  await page.evaluate(async () => {
    const listenable = new window.Logic.Listenable<PointerhoverType, PointerhoverMetadata>(
      'recognizeable' as PointerhoverType,
      { recognizeable: { effects: window.Logic.createPointerhover() } }
    )

    window.testState = { listenable: listenable.listen(() => {}, { target: document.getElementById('el') }) }
  })

  await page.mouse.move(21, 21)
  await page.waitForTimeout(10)

  const value = await page.evaluate(() => (window.testState.listenable as Listenable<PointerhoverType, PointerhoverMetadata>).recognizeable.status),
        expected = 'recognized'

  assert.is(value, expected)

  reloadNext()
})

suite('respects minDuration option', async ({ playwright: { page, reloadNext } }) => {
  await page.evaluate(async () => {
    const listenable = new window.Logic.Listenable<PointerhoverType, PointerhoverMetadata>(
      'recognizeable' as PointerhoverType,
      { recognizeable: { effects: window.Logic.createPointerhover({ minDuration: 100 }) } }
    )

    window.testState = { listenable: listenable.listen(() => {}, { target: document.getElementById('el') }) }
  })

  await page.mouse.move(21, 21)
  await page.waitForTimeout(50)

  const recognizing = await page.evaluate(() => (window.testState.listenable as Listenable<PointerhoverType, PointerhoverMetadata>).recognizeable.status)
  assert.is(recognizing, 'recognizing')

  await page.waitForTimeout(100)
  const recognized = await page.evaluate(() => (window.testState.listenable as Listenable<PointerhoverType, PointerhoverMetadata>).recognizeable.status)
  assert.is(recognized, 'recognized')

  reloadNext()
})

suite('calls hooks', async ({ playwright: { page, reloadNext } }) => {
  await page.evaluate(async () => {
    window.testState = {
      hooks: {
        onOver: false,
        onOut: false,
      },
    }

    const listenable = new window.Logic.Listenable<PointerhoverType, PointerhoverMetadata>(
      'recognizeable' as PointerhoverType,
      {
        recognizeable: {
          effects: window.Logic.createPointerhover({
            onOver: () => window.testState.hooks.onOver = true,
            onOut: () => window.testState.hooks.onOut = true,
          }),
        },
      }
    )

    listenable.listen(() => {}, { target: document.getElementById('el') })
  })

  await page.mouse.move(21, 21)
  await page.mouse.move(19, 19)

  const value = await page.evaluate(() => window.testState.hooks),
        expected = { onOver: true, onOut: true }

  assert.equal(value, expected)

  reloadNext()
})

suite('denies on mouseout', async ({ playwright: { page, reloadNext } }) => {
  await page.evaluate(async () => {
    const listenable = new window.Logic.Listenable<PointerhoverType, PointerhoverMetadata>(
      'recognizeable' as PointerhoverType,
      { recognizeable: { effects: window.Logic.createPointerhover() } }
    )

    window.testState = { listenable: listenable.listen(() => {}, { target: document.getElementById('el') }) }
  })

  await page.mouse.move(21, 21)
  await page.mouse.move(19, 19)

  const value = await page.evaluate(() => (window.testState.listenable as Listenable<PointerhoverType, PointerhoverMetadata>).recognizeable.status),
        expected = 'denied'

  assert.is(value, expected)

  reloadNext()
})

suite.run()
