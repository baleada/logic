import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'
import type {
  KeypressType,
  KeypressMetadata,
} from '../../src/factories'
import type { RecognizeableStatus } from '../../src/classes'

const suite = withPlaywright(
  createSuite('createKeypress')
)

// TODO
// meta is blocked
// visibilitychange
// releasing invalid partial combo doesn't trigger smaller combo

for (const key of ['a', 'Shift', ',']) {
  suite('recognizes keypress', async ({ playwright: { page } }) => {
    await page.evaluate(async key => {
      const listenable = new window.Logic.Listenable<KeypressType, KeypressMetadata>(
        'recognizeable' as KeypressType, 
        { recognizeable: { effects: window.Logic.createKeypress(key) } }
      )
  
      window.testState = { listenable: listenable.listen(() => {}) }
    }, key)
  
    await page.keyboard.down(key)
    await page.waitForTimeout(20)
    
    const value = await page.evaluate(() => window.testState.listenable.recognizeable.status as RecognizeableStatus),
          expected = 'recognized'
  
    assert.is(value, expected, key)
  
    await page.keyboard.up(key)
    await page.evaluate(() => window.testState.listenable.stop())
  })
}

for (const key of ['a', 'Shift', ',']) {
  suite('recognizes keypress on every frame', async ({ playwright: { page } }) => {
    await page.evaluate(async key => {
      const listenable = new window.Logic.Listenable<KeypressType, KeypressMetadata>(
        'recognizeable' as KeypressType, 
        { recognizeable: { effects: window.Logic.createKeypress(key) } }
      )
  
      window.testState = {
        count: 0,
        listenable: listenable.listen(() => {
          window.testState.count++
        }),
      }
    }, key)
  
    await page.keyboard.down(key)
    await page.waitForTimeout(100)
    
    const value = await page.evaluate(() => window.testState.count)
  
    assert.ok(value > 1, key)
  
    await page.keyboard.up(key)
    await page.evaluate(() => window.testState.listenable.stop())
  })
}

for (const key of ['a', 'Shift', ',']) {
  suite('respects minDuration option', async ({ playwright: { page } }) => {
    await page.evaluate(async key => {
      const listenable = new window.Logic.Listenable<KeypressType, KeypressMetadata>(
        'recognizeable' as KeypressType, 
        { recognizeable: { effects: window.Logic.createKeypress(key, { minDuration: 100 }) } }
      )

      window.testState = { listenable: listenable.listen(() => {}) }
    }, key)

    await page.keyboard.down(key)
    await page.waitForTimeout(50)
    
    const recognizing = await page.evaluate(() => window.testState.listenable.recognizeable.status as RecognizeableStatus)  
    assert.is(recognizing, 'recognizing')

    await page.waitForTimeout(150)

    const recognized = await page.evaluate(() => window.testState.listenable.recognizeable.status as RecognizeableStatus)
    assert.is(recognized, 'recognized')

    await page.keyboard.up(key)
    await page.evaluate(() => window.testState.listenable.stop())
  })
}

suite('recognizes arrays of keycombos', async ({ playwright: { page } }) => {
  await page.evaluate(async () => {
    const listenable = new window.Logic.Listenable<KeypressType, KeypressMetadata>(
      'recognizeable' as KeypressType, 
      { recognizeable: { effects: window.Logic.createKeypress(['a', 'b']) } }
    )

    window.testState = { listenable: listenable.listen(() => {}) }
  })

  for (const key of ['a', 'b']) {
    await page.keyboard.down(key)
    await page.waitForTimeout(20)
    
    const value = await page.evaluate(() => window.testState.listenable.recognizeable.status as RecognizeableStatus),
          expected = 'recognized'
  
    assert.is(value, expected)

    await page.keyboard.up(key)
    await page.waitForTimeout(20)
  }

  await page.keyboard.down('C')
  await page.waitForTimeout(20)
  
  const value = await page.evaluate(() => window.testState.listenable.recognizeable.status as RecognizeableStatus),
        expected = 'denied'

  assert.is(value, expected)

  await page.keyboard.up('C')
  await page.evaluate(() => window.testState.listenable.stop())
})

suite('stores currently pressed keycombo', async ({ playwright: { page } }) => {
  await page.evaluate(async () => {
    const listenable = new window.Logic.Listenable<KeypressType, KeypressMetadata>(
      'recognizeable' as KeypressType, 
      { recognizeable: { effects: window.Logic.createKeypress(['a', 'b']) } }
    )

    window.testState = { listenable: listenable.listen(() => {}) }
  })

  for (const key of ['a', 'b']) {
    await page.keyboard.down(key)
    await page.waitForTimeout(20)
    
    const value = await page.evaluate(() => window.testState.listenable.recognizeable.metadata.pressed),
          expected = key
    
    assert.equal(value, expected)
    
    await page.keyboard.up(key)
    await page.waitForTimeout(20)
  }

  await page.evaluate(() => window.testState.listenable.stop())
})

for (const key of ['a', 'Shift', ',']) {
  suite('denies until all combos are released if non-matching keycombo happened', async ({ playwright: { page } }) => {
    await page.evaluate(async key => {
      const listenable = new window.Logic.Listenable<KeypressType, KeypressMetadata>(
        'recognizeable' as KeypressType, 
        { recognizeable: { effects: window.Logic.createKeypress([key, 'b']) } }
      )
  
      window.testState = { listenable: listenable.listen(() => {}) }
    }, key)
  
    await page.keyboard.down(key)
    await page.waitForTimeout(20)
    await page.keyboard.down('b')
    await page.waitForTimeout(20)
    await page.keyboard.up('b')
    await page.waitForTimeout(20)
  
    await (async () => {
      const value = await page.evaluate(() => window.testState.listenable.recognizeable.status as RecognizeableStatus),
            expected = 'denied'
  
      assert.is(value, expected)
    })()
  
    await page.keyboard.up(key)
    await page.waitForTimeout(20)
  
    await (async () => {
      const value = await page.evaluate(() => window.testState.listenable.recognizeable.status as RecognizeableStatus),
            expected = 'denied'
  
      assert.is(value, expected)
    })()
  
    await page.keyboard.down('b')
    await page.waitForTimeout(20)
  
    await (async () => {
      const value = await page.evaluate(() => window.testState.listenable.recognizeable.status as RecognizeableStatus),
            expected = 'recognized'
  
      assert.is(value, expected)
    })()
  
    await page.keyboard.up('b')
    await page.evaluate(() => window.testState.listenable.stop())
  })
}

suite('does not require all keys to be released before re-recognizing', async ({ playwright: { page } }) => {
  await page.evaluate(async () => {
    const listenable = new window.Logic.Listenable<KeypressType, KeypressMetadata>(
      'recognizeable' as KeypressType,
      { recognizeable: { effects: window.Logic.createKeypress('a+b') } }
    )

    window.testState = {
      count: 0,
      listenable: listenable.listen(() => {
        window.testState.count++
      }),
    }
  })

  await page.keyboard.down('a')
  await page.waitForTimeout(20)
  await page.keyboard.down('b')
  await page.waitForTimeout(20)
  await page.keyboard.up('a')
  await page.waitForTimeout(20)

  await (async () => {
    const value = await page.evaluate(() => window.testState.count)

    assert.ok(value > 0)
  })()

  const previousValue = await page.evaluate(() => window.testState.count)
  
  await page.keyboard.down('a')
  await page.waitForTimeout(20)

  await (async () => {
    const value = await page.evaluate(() => window.testState.count)

    assert.ok(value > previousValue)
  })()

  await page.keyboard.up('a')
  await page.evaluate(() => window.testState.listenable.stop())
})

suite('handles arrays of overlapping combos', async ({ playwright: { page } }) => {
  await page.evaluate(async () => {
    const listenable = new window.Logic.Listenable<KeypressType, KeypressMetadata>(
      'recognizeable' as KeypressType,
      { recognizeable: { effects: window.Logic.createKeypress(['a', 'shift+a', 'shift+opt+a']) } }
    )

    window.testState = {
      count: 0,
      listenable: listenable.listen(() => {
        window.testState.count++
      }),
    }
  })

  await page.keyboard.down('a')
  await page.waitForTimeout(20)

  await (async () => {
    const value = await page.evaluate(() => window.testState.count)

    assert.ok(value > 0)

    const pressed = await page.evaluate(() => window.testState.listenable.recognizeable.metadata.pressed)

    assert.is(pressed, 'a')
  })()

  await (async () => {
    const previousValue = await page.evaluate(() => window.testState.count)

    await page.keyboard.down('Shift')
    await page.waitForTimeout(20)

    const value = await page.evaluate(() => window.testState.count)

    assert.ok(value > previousValue, JSON.stringify([value, previousValue]))

    const pressed = await page.evaluate(() => window.testState.listenable.recognizeable.metadata.pressed)

    assert.is(pressed, 'shift+a')
  })()
  
  await (async () => {
    const previousValue = await page.evaluate(() => window.testState.count)

    await page.keyboard.down('Alt')
    await page.waitForTimeout(20)

    const value = await page.evaluate(() => window.testState.count)

    assert.ok(value > previousValue, JSON.stringify([value, previousValue]))

    const pressed = await page.evaluate(() => window.testState.listenable.recognizeable.metadata.pressed)

    assert.is(pressed, 'shift+opt+a')
  })()

  await page.keyboard.up('a')
  await page.keyboard.up('Shift')
  await page.keyboard.up('Alt')
  await page.evaluate(() => window.testState.listenable.stop())
})

suite.run()
