import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'
import type {
  MousereleaseTypes,
  MousereleaseMetadata,
} from '../../src/factories'
import type { Listenable } from '../../src/classes/Listenable'

const suite = withPlaywright(
  createSuite('createMouserelease')
)

suite('recognizes mouserelease', async ({ playwright: { page, reloadNext } }) => {
  await page.evaluate(async () => {
    const listenable = new window.Logic.Listenable<MousereleaseTypes, MousereleaseMetadata>(
      'recognizeable' as MousereleaseTypes,
      { recognizeable: { effects: window.Logic.createMouserelease() } }
    )

    window.testState = { listenable: listenable.listen(() => {}) }
  })

  await page.mouse.down()
  await page.mouse.move(0, 100)
  await page.mouse.up()
  
  const value = await page.evaluate(() => window.testState.listenable.recognizeable.status),
        expected = 'recognized'

  assert.is(value, expected)

  reloadNext()
})

suite('respects minDuration option', async ({ playwright: { page, reloadNext } }) => {
  await page.evaluate(async () => {
    const listenable = new window.Logic.Listenable<MousereleaseTypes, MousereleaseMetadata>(
      'recognizeable' as MousereleaseTypes, 
      { recognizeable: { effects: window.Logic.createMouserelease({ minDuration: 1000 }) } }
    )

    window.testState = { listenable: listenable.listen(() => {}) }
  })

  await page.mouse.down()
  await page.waitForTimeout(500)
  
  const recognizing = await page.evaluate(() => (window.testState.listenable as Listenable<MousereleaseTypes, MousereleaseMetadata>).recognizeable.status)  
  assert.is(recognizing, 'recognizing')

  await page.waitForTimeout(1000)
  await page.mouse.up()
  const recognized = await page.evaluate(() => (window.testState.listenable as Listenable<MousereleaseTypes, MousereleaseMetadata>).recognizeable.status)
  assert.is(recognized, 'recognized')

  reloadNext()
})

suite('respects minDistance option', async ({ playwright: { page, reloadNext } }) => {
  await page.evaluate(async () => {
    const listenable = new window.Logic.Listenable<MousereleaseTypes, MousereleaseMetadata>(
      'recognizeable' as MousereleaseTypes,
      { recognizeable: { effects: window.Logic.createMouserelease({ minDistance: 101 }) } }
    )
    
    window.testState = { listenable: listenable.listen(() => {}) }
  })

  await page.mouse.down()
  await page.mouse.move(0, 100)
  await page.mouse.up()
  
  const from = await page.evaluate(() => window.testState.listenable.recognizeable.status)
  assert.is(from, 'denied')
  
  await page.mouse.move(0, 0)
  await page.mouse.down()
  await page.mouse.move(0, 101)
  await page.mouse.up()
  
  const to = await page.evaluate(() => window.testState.listenable.recognizeable.status)
  assert.is(to, 'recognized')

  reloadNext()
})

suite.skip('respects minVelocity option', async ({ playwright: { page, reloadNext } }) => {
  // TODO: can't quite get test to work. Feature was manually tested.
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

    const listenable = new window.Logic.Listenable<MousereleaseTypes, MousereleaseMetadata>(
      'recognizeable' as MousereleaseTypes,
      {
        recognizeable: {
          effects: window.Logic.createMouserelease({
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

suite('doesn\'t listen for mousemove before mousedown', async ({ playwright: { page, reloadNext } }) => {
  await page.evaluate(async () => {
    window.testState = {
      hooks: {
        onMove: false,
      },
    }

    const listenable = new window.Logic.Listenable<MousereleaseTypes, MousereleaseMetadata>(
      'recognizeable' as MousereleaseTypes,
      {
        recognizeable: {
          effects: window.Logic.createMouserelease({
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

suite('doesn\'t listen for mousemove after mouseup', async ({ playwright: { page, reloadNext } }) => {
  await page.evaluate(async () => {
    window.testState = {
      hooks: {
        onMove: false,
        onUp: false,
      },
    }

    const listenable = new window.Logic.Listenable<MousereleaseTypes, MousereleaseMetadata>(
      'recognizeable' as MousereleaseTypes,
      {
        recognizeable: {
          effects: window.Logic.createMouserelease({
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

suite.run()
