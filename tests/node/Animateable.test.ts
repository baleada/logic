import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { Animateable } from '../../src/classes/Animateable'

const suite = createSuite('Animateable (node)')

suite.before.each(context => {
  context.setup = (options = {}) => new Animateable(
    [
      { progress: 0, data: { example: 0 } },
      { progress: 1, data: { example: 1 } }
    ],
    options
  )
})

/* Basic */
suite('initial playbackRate is 1', context => {
  const instance = context.setup()

  assert.is(instance.playbackRate, 1)
})

suite('assignment sets the playback rate', context => {
  const instance = context.setup()
  instance.playbackRate = 2

  assert.is(instance.playbackRate, 2)
})

suite('setPlaybackRate sets the playback rate', context => {
  const instance = context.setup()
  instance.setPlaybackRate(2)

  assert.is(instance.playbackRate, 2)
})

suite('status is "ready" after construction', context => {
  const instance = context.setup()

  assert.is(instance.status, 'ready')
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
