import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'

import { withPlaywright } from '@baleada/prepare'
import { withPlaywrightOptions } from '../fixtures/withPlaywrightOptions'
import type { AnimateableKeyframe } from '../../src/classes'

type Context = {
  keyframes: AnimateableKeyframe<any>[]
}

const suite = withPlaywright(
  createSuite<Context>('Animateable'),
  withPlaywrightOptions
)

suite.before(context => {
  context.keyframes = [
    { progress: 0, properties: { example: 0 } },
    { progress: 1, properties: { example: 1 } },
  ]
})

suite('initial playbackRate is 1', async ({ playwright: { page }, keyframes }) => {
  const value = await page.evaluate((keyframes: AnimateableKeyframe<any>[]) => {
    const instance = new window.Logic.Animateable(keyframes)
    return instance.playbackRate
  }, keyframes)

  assert.is(value, 1)
})

suite('assignment sets the playback rate', async ({ playwright: { page }, keyframes }) => {
  const value = await page.evaluate((keyframes: AnimateableKeyframe<any>[]) => {
    const instance = new window.Logic.Animateable(keyframes)
    instance.playbackRate = 2
    return instance.playbackRate
  }, keyframes)

  assert.is(value, 2)
})

suite('setPlaybackRate sets the playback rate', async ({ playwright: { page }, keyframes }) => {
  const value = await page.evaluate((keyframes: AnimateableKeyframe<any>[]) => {
    const instance = new window.Logic.Animateable(keyframes)
    return instance.setPlaybackRate(2).playbackRate
  }, keyframes)

  assert.is(value, 2)
})

suite('status is "ready" after construction', async ({ playwright: { page }, keyframes }) => {
  const value = await page.evaluate((keyframes: AnimateableKeyframe<any>[]) => {
    const instance = new window.Logic.Animateable(keyframes)
    return instance.status
  }, keyframes)

  assert.is(value, 'ready')
})


/* INFORMAL */

// assign keyframes
// setKeyframes

// iterations
// request
// time
// progress

// play
// play -> reverse
// play -> pause
// play -> seek
// play -> restart

// reverse
// reverse -> play
// reverse -> pause
// reverse -> seek
// reverse -> restart

// seek -> play

// stop

// alternates -> play
// alternates -> reverse
// alternates -> play -> seek
// alternates -> reverse -> seek
// alternates -> seek

// iterations -> play
// iterations -> reverse
// iterations -> alternates -> play
// iterations -> alternates -> reverse
// iterations -> seek

// method chaining

suite.run()
