import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'
import type {
  KeyreleaseTypes,
  KeyreleaseMetadata,
} from '../../src/factories/recognizeable-effects'
import type { RecognizeableStatus } from '../../src/classes'

const suite = withPlaywright(
  createSuite('createKeyrelease')
)

// TODO
// single letter
// multiple letters
// single modifier
// multiple modifiers
// modifier + letter
// special characters
// partially down combo stuff
// meta is blocked
// releasing invalid partial combo doesn't trigger smaller combo

for (const key of ['A', 'Shift', ',']) {
  suite('recognizes keyrelease', async ({ playwright: { page } }) => {
    await page.evaluate(async key => {
      const listenable = new window.Logic.Listenable<KeyreleaseTypes, KeyreleaseMetadata>(
        'recognizeable' as KeyreleaseTypes, 
        { recognizeable: { effects: window.Logic.createKeyrelease(key) } }
      )
  
      window.testState = { listenable: listenable.listen(() => {}) }
    }, key)
  
    await page.keyboard.down(key)
    await page.waitForTimeout(20)
    await page.keyboard.up(key)
    await page.waitForTimeout(20)
    
    const value = await page.evaluate(() => window.testState.listenable.recognizeable.status as RecognizeableStatus),
          expected = 'recognized'
  
    assert.is(value, expected, key)
  
    await page.evaluate(() => window.testState.listenable.stop())
  })
}

for (const key of ['A', 'Shift', ',']) {
  suite('recognizes keyrelease only once', async ({ playwright: { page } }) => {
    await page.evaluate(async key => {
      const listenable = new window.Logic.Listenable<KeyreleaseTypes, KeyreleaseMetadata>(
        'recognizeable' as KeyreleaseTypes, 
        { recognizeable: { effects: window.Logic.createKeyrelease(key) } }
      )
  
      window.testState = {
        count: 0,
        listenable: listenable.listen(() => {
          window.testState.count++
        }),
      }
    }, key)
  
    await page.keyboard.down(key)
    await page.waitForTimeout(20)
    await page.keyboard.up(key)
    await page.waitForTimeout(20)
    
    const value = await page.evaluate(() => window.testState.count),
          expected = 1
  
    assert.is(value, expected, key)
  
    await page.evaluate(() => window.testState.listenable.stop())
  })
}

for (const key of ['A', 'Shift', ',']) {
  suite('respects minDuration option', async ({ playwright: { page } }) => {
    await page.evaluate(async key => {
      const listenable = new window.Logic.Listenable<KeyreleaseTypes, KeyreleaseMetadata>(
        'recognizeable' as KeyreleaseTypes, 
        { recognizeable: { effects: window.Logic.createKeyrelease(key, { minDuration: 100 }) } }
      )

      window.testState = { listenable: listenable.listen(() => {}) }
    }, key)

    await page.keyboard.down(key)
    await page.waitForTimeout(50)
    await page.keyboard.up(key)
    await page.waitForTimeout(20)
    
    const recognizing = await page.evaluate(() => window.testState.listenable.recognizeable.status as RecognizeableStatus)  
    assert.is(recognizing, 'denied')

    await page.keyboard.down(key)
    await page.waitForTimeout(200)
    await page.keyboard.up(key)
    await page.waitForTimeout(20)

    const recognized = await page.evaluate(() => window.testState.listenable.recognizeable.status as RecognizeableStatus)
    assert.is(recognized, 'recognized')

    await page.evaluate(() => window.testState.listenable.stop())
  })
}

suite('recognizes arrays of keycombos', async ({ playwright: { page } }) => {
  await page.evaluate(async () => {
    const listenable = new window.Logic.Listenable<KeyreleaseTypes, KeyreleaseMetadata>(
      'recognizeable' as KeyreleaseTypes, 
      { recognizeable: { effects: window.Logic.createKeyrelease(['A', 'B']) } }
    )

    window.testState = { listenable: listenable.listen(() => {}) }
  })

  for (const key of ['A', 'B']) {
    await page.keyboard.down(key)
    await page.waitForTimeout(20)
    await page.keyboard.up(key)
    await page.waitForTimeout(20)
    
    const value = await page.evaluate(() => window.testState.listenable.recognizeable.status as RecognizeableStatus),
          expected = 'recognized'
  
    assert.is(value, expected)
  }

  await page.keyboard.down('C')
  await page.waitForTimeout(20)
  
  const value = await page.evaluate(() => window.testState.listenable.recognizeable.status as RecognizeableStatus),
        expected = 'denied'

  assert.is(value, expected)

  await page.evaluate(() => window.testState.listenable.stop())
})

suite('stores most recently released keycombo', async ({ playwright: { page } }) => {
  await page.evaluate(async () => {
    const listenable = new window.Logic.Listenable<KeyreleaseTypes, KeyreleaseMetadata>(
      'recognizeable' as KeyreleaseTypes, 
      { recognizeable: { effects: window.Logic.createKeyrelease(['A', 'B']) } }
    )

    window.testState = { listenable: listenable.listen(() => {}) }
  })

  for (const key of ['A', 'B']) {
    await page.keyboard.down(key)
    await page.waitForTimeout(20)
    await page.keyboard.up(key)
    await page.waitForTimeout(20)
  }
    
  const value = await page.evaluate(() => window.testState.listenable.recognizeable.metadata.released),
        expected = 'B'

  assert.equal(value, expected)

  await page.evaluate(() => window.testState.listenable.stop())
})

for (const key of ['A', 'Shift', ',']) {
  suite('denies until all combos are released if non-matching keycombo happened', async ({ playwright: { page } }) => {
    await page.evaluate(async key => {
      const listenable = new window.Logic.Listenable<KeyreleaseTypes, KeyreleaseMetadata>(
        'recognizeable' as KeyreleaseTypes, 
        { recognizeable: { effects: window.Logic.createKeyrelease([key, 'B']) } }
      )
  
      window.testState = { listenable: listenable.listen(() => {}) }
    }, key)
  
    await page.keyboard.down(key)
    await page.waitForTimeout(20)
    await page.keyboard.down('B')
    await page.waitForTimeout(20)
    await page.keyboard.up('B')
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
  
    await page.keyboard.down('B')
    await page.waitForTimeout(20)
  
    await (async () => {
      const value = await page.evaluate(() => window.testState.listenable.recognizeable.status as RecognizeableStatus),
            expected = 'recognizing'
  
      assert.is(value, expected)
    })()
  
    await page.evaluate(() => window.testState.listenable.stop())
  })
}

suite('only recognizes when first key of combo goes up', async ({ playwright: { page } }) => {
  await page.evaluate(async () => {
    const listenable = new window.Logic.Listenable<KeyreleaseTypes, KeyreleaseMetadata>(
      'recognizeable' as KeyreleaseTypes,
      { recognizeable: { effects: window.Logic.createKeyrelease('A+B') } }
    )

    window.testState = {
      count: 0,
      listenable: listenable.listen(() => {
        window.testState.count++
      }),
    }
  })

  await page.keyboard.down('A')
  await page.waitForTimeout(20)
  await page.keyboard.down('B')
  await page.waitForTimeout(20)
  await page.keyboard.up('A')
  await page.waitForTimeout(20)

  await (async () => {
    const value = await page.evaluate(() => window.testState.count),
          expected = 1

    assert.is(value, expected)
  })()
  
  await page.keyboard.up('B')
  await page.waitForTimeout(20)

  await (async () => {
    const value = await page.evaluate(() => window.testState.count),
          expected = 1

    assert.is(value, expected)
  })()

  await page.evaluate(() => window.testState.listenable.stop())
})

suite('does not require all keys to be released before re-recognizing', async ({ playwright: { page } }) => {
  await page.evaluate(async () => {
    const listenable = new window.Logic.Listenable<KeyreleaseTypes, KeyreleaseMetadata>(
      'recognizeable' as KeyreleaseTypes,
      { recognizeable: { effects: window.Logic.createKeyrelease('A+B') } }
    )

    window.testState = {
      count: 0,
      listenable: listenable.listen(() => {
        window.testState.count++
      }),
    }
  })

  await page.keyboard.down('A')
  await page.waitForTimeout(20)
  await page.keyboard.down('B')
  await page.waitForTimeout(20)
  await page.keyboard.up('A')
  await page.waitForTimeout(20)

  await (async () => {
    const value = await page.evaluate(() => window.testState.count),
          expected = 1

    assert.is(value, expected)
  })()
  
  await page.keyboard.down('A')
  await page.waitForTimeout(20)
  await page.keyboard.up('A')
  await page.waitForTimeout(20)

  await (async () => {
    const value = await page.evaluate(() => window.testState.count),
          expected = 2

    assert.is(value, expected)
  })()

  await page.evaluate(() => window.testState.listenable.stop())
})

suite('handles arrays of overlapping combos', async ({ playwright: { page } }) => {
  await page.evaluate(async () => {
    const listenable = new window.Logic.Listenable<KeyreleaseTypes, KeyreleaseMetadata>(
      'recognizeable' as KeyreleaseTypes,
      { recognizeable: { effects: window.Logic.createKeyrelease(['a', 'shift+a', 'shift+opt+a']) } }
    )

    window.testState = {
      count: 0,
      listenable: listenable.listen(() => {
        window.testState.count++
      }),
    }
  })

  await page.keyboard.down('A')
  await page.waitForTimeout(20)
  await page.keyboard.down('Shift')
  await page.waitForTimeout(20)
  await page.keyboard.down('Alt')
  await page.waitForTimeout(20)
  await page.keyboard.up('A')
  await page.waitForTimeout(20)

  await (async () => {
    const value = await page.evaluate(() => window.testState.count),
          expected = 1

    assert.is(value, expected)
  })()

  await page.keyboard.up('Shift')
  await page.waitForTimeout(20)

  await (async () => {
    const value = await page.evaluate(() => window.testState.count),
          expected = 1

    assert.is(value, expected)
  })()

  await page.keyboard.up('Alt')
  await page.waitForTimeout(20)

  await (async () => {
    const value = await page.evaluate(() => window.testState.count),
          expected = 1

    assert.is(value, expected)
  })()

  await page.keyboard.down('A')
  await page.waitForTimeout(20)
  await page.keyboard.down('Shift')
  await page.waitForTimeout(20)
  await page.keyboard.up('A')
  await page.waitForTimeout(20)

  await (async () => {
    const value = await page.evaluate(() => window.testState.count),
          expected = 2

    assert.is(value, expected)
  })()

  await page.keyboard.up('Shift')
  await page.waitForTimeout(20)

  await (async () => {
    const value = await page.evaluate(() => window.testState.count),
          expected = 2

    assert.is(value, expected)
  })()

  await page.keyboard.down('A')
  await page.waitForTimeout(20)
  await page.keyboard.up('A')
  await page.waitForTimeout(20)

  await (async () => {
    const value = await page.evaluate(() => window.testState.count),
          expected = 3

    assert.is(value, expected)
  })()

  await page.evaluate(() => window.testState.listenable.stop())
})

suite.run()
