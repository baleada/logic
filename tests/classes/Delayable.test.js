import test from 'ava'
import Delayable from '../../src/classes/Delayable'
import guardUntilDelayed from '../../src/util/guardUntilDelayed'

console.log('WARNING: Delayable requires informal testing')

const callback = timestamp => 1 + 1,
      differentCallback = timestamp => 2 + 2

test.beforeEach(t => {
  t.context.setup = (options = {}) => new Delayable(callback, options)
})

test('status is "ready" after construction', t => {
  const instance = t.context.setup()

  t.is(instance.status, 'ready')
})


/* INFORMAL */

// callback is guarded until delayed
// assignment guards the callback until delayed
// setCallback guards the callback until delayed

// delay
// delay -> delay
// delay -> pause
// delay -> seek

// pause
// pause -> resume

// seek
// seek -> resume

// stop