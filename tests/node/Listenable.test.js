import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { Listenable } from '../../lib/index.js'

const suite = createSuite('Listenable (node)')

suite.before.each(context => {
  context.setup = (options = {}) => new Listenable('click', options)
})

suite('stores the type', context => {
  const instance = context.setup()

  assert.is(instance.type, 'click')
})

suite('assignment sets the type', context => {
  const instance = context.setup()
  instance.type = 'keydown'

  assert.is(instance.type, 'keydown')
})

suite('setType sets the type', context => {
  const instance = context.setup()
  instance.setType('keydown')

  assert.is(instance.type, 'keydown')
})

suite('activeListeners is empty after construction', context => {
  const instance = context.setup()

  assert.equal(instance.activeListeners, [])
})


/* status */
suite('status is "ready" after construction', context => {
  const instance = context.setup()

  assert.is(instance.status, 'ready')
})

/* INFORMAL */


// keycombo
//   zero modifiers
//   one modifier
//   two modifiers
//   three modifiers
//   four modifiers
//   up
//   down
//   left
//   right
//   enter
//   backspace
//   tab
//   number


// status is "listening" after listen(...) is called at least once
// status is "listening" after some active listeners are stopped
// status is "stopped" after all active listeners are stopped

suite.run()
