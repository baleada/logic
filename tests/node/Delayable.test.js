import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { Delayable } from '../fixtures/TEST_BUNDLE.js'

console.log('WARNING: Delayable requires browser testing')

const suite = createSuite('Delayable (node)')

const callback = timestamp => 1 + 1,
      differentCallback = timestamp => 2 + 2

suite.before.each(context => {
  context.setup = (options = {}) => new Delayable(callback, options)
})

suite('status is "ready" after construction', context => {
  const instance = context.setup()

  assert.is(instance.status, 'ready')
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

suite.run()
