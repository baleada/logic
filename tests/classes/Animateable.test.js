import test from 'ava'
import Animateable from '../../src/classes/Animateable'

console.log('WARNING: Animateable requires informal testing')

test.beforeEach(t => {
  t.context.setup = (options = {}) => new Animateable(
    [
      { progress: 0, data: { example: 0 } },
      { progress: 1, data: { example: 1 } }
    ],
    options
  )
})

/* Basic */
test('initial playbackRate is 1', t => {
  const instance = t.context.setup()

  t.is(instance.playbackRate, 1)
})

test('assignment sets the playback rate', t => {
  const instance = t.context.setup()
  instance.playbackRate = 2

  t.is(instance.playbackRate, 2)
})

test('setPlaybackRate sets the playback rate', t => {
  const instance = t.context.setup()
  instance.setPlaybackRate(2)

  t.is(instance.playbackRate, 2)
})

test('status is "ready" after construction', t => {
  const instance = t.context.setup()

  t.is(instance.status, 'ready')
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