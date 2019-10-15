import test from 'ava'
import Togglable from '../../src/classes/Toggleable'

test.beforeEach(t => {
  t.context.setup = (options) => new Togglable(true, options)
})

test('stores the boolean', t => {
  const instance = t.context.setup()

  t.is(instance.boolean, true)
})

test('setBoolean sets the boolean', t => {
  const instance = t.context.setup()
  instance.setBoolean(false)

  t.is(instance.boolean, false)
})

test('toggle() sets boolean to its opposite', t => {
  const instance = t.context.setup()

  instance.toggle()

  t.is(instance.boolean, false)
})

test('true() sets boolean to true', t => {
  const instance = t.context.setup()

  instance.true()

  t.is(instance.boolean, true)
})

test('false() sets boolean to false', t => {
  const instance = t.context.setup()

  instance.false()

  t.is(instance.boolean, false)
})

test('can method chain', t => {
  const instance = t.context.setup(),
        chained = instance
          .toggle()
          .true()
          .false()

  t.assert(chained instanceof Togglable)
})
