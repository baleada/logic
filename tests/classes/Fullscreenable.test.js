import test from 'ava'
import { Fullscreenable } from '../../lib/index.esm.js'

console.log('WARNING: Fullscreenable requires browser testing')

const elementStub = {}

test.beforeEach(t => {
  t.context.setup = (options = {}) => new Fullscreenable(
    () => elementStub,
    options
  )
})

test('stores the getElement', t => {
  const instance = t.context.setup()

  t.assert(instance.getElement instanceof Function)
})

test('assignment sets the getElement', t => {
  const instance = t.context.setup()
  instance.getElement = () => 'poopy'

  t.assert(instance.getElement instanceof Function)
})

test('setGetElement sets the getElement', t => {
  const instance = t.context.setup()
  instance.setGetElement(() => 'poopy')

  t.assert(instance.getElement instanceof Function)
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

