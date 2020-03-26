import test from 'ava'
import Fullscreenable from '../../src/classes/Fullscreenable'

console.log('WARNING: Fullscreenable requires informal testing')

const elementStub = {}

test.beforeEach(t => {
  t.context.setup = (options = {}) => new Fullscreenable(
    () => elementStub,
    options
  )
})

test('stores the elementGetter', t => {
  const instance = t.context.setup()

  t.assert(instance.elementGetter instanceof Function)
})

test('assignment sets the elementGetter', t => {
  const instance = t.context.setup()
  instance.elementGetter = () => 'poopy'

  t.assert(instance.elementGetter instanceof Function)
})

test('setElementGetter sets the elementGetter', t => {
  const instance = t.context.setup()
  instance.setElementGetter(() => 'poopy')

  t.assert(instance.elementGetter instanceof Function)
})

test('status is "ready" after construction', t => {
  const instance = t.context.setup()

  t.is(instance.status, 'ready')
})


/* INFORMAL */

// element
// error

// enter
// fullscreen
// exit

