import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { Navigateable } from '../fixtures/TEST_BUNDLE.js'

const suite = createSuite('Navigateable (node)')

suite.before.each(context => {
  context.setup = (options = {}) => new Navigateable(
    ['tortilla', 'frijoles', 'mantequilla', 'aguacate', 'huevito'],
    options
  )
})

suite('stores the array', context => {
  const instance = context.setup()

  assert.equal(instance.array, ['tortilla', 'frijoles', 'mantequilla', 'aguacate', 'huevito'])
})

suite('assignment sets the array', context => {
  const instance = context.setup()
  instance.array = ['Baleada']

  assert.equal(instance.array, ['Baleada'])
})

suite('setArray sets the array', context => {
  const instance = context.setup()
  instance.setArray(['Baleada'])

  assert.equal(instance.array, ['Baleada'])
})

suite('initial location is 0 by default', context => {
  const instance = context.setup()

  assert.is(instance.location, 0)
})

suite('initial location can be customized via options', context => {
  const instance = context.setup({
    initialLocation: 1,
  })

  assert.is(instance.location, 1)
})

suite('assignment sets the location', context => {
  const instance = context.setup()

  instance.location = 1

  assert.is(instance.location, 1)
})

suite('setLocation sets the location', context => {
  const instance = context.setup()

  instance.setLocation(1)

  assert.is(instance.location, 1)
})

/* navigate */
suite('navigate(newLocation) navigates to the last item in the array when newLocation is greater than the index of the last item in the array', context => {
  const instance = context.setup()

  instance.navigate(42)

  assert.is(instance.location, instance.array.length - 1)
})

suite('navigate(newLocation) navigates to 0 when newLocation is less than 0', context => {
  const instance = context.setup()

  instance.navigate(-42)

  assert.is(instance.location, 0)
})

suite('navigate(newLocation) navigates to newLocation', context => {
  const instance = context.setup()

  instance.navigate(1)

  assert.is(instance.location, 1)
})

/* next */
suite('next() increments the current location by 1 when distance is default', context => {
  const instance = context.setup()

  instance.next()

  assert.is(instance.location, 1)
})

suite('next() increments the current location by distance when distance is not default', context => {
  const instance = context.setup()

  instance.next({ distance: 2, })

  assert.is(instance.location, 2)
})

suite('next() loops back through the array by default when the current location is greater than the last location', context => {
  const instance = context.setup()

  instance.navigate(instance.array.length - 1)
  instance.next()

  assert.is(instance.location, 0)
})

suite('next() loops continuously through the array by default until current location is less than or equal to the last location', context => {
  const instance = context.setup()

  instance.next({ distance: 15 })

  assert.is(instance.location, 0)
})

suite('next() stops at the last location when loops is false AND incremented location is greater than the last location', context => {
  const instance = context.setup()

  instance.navigate(instance.array.length - 1)
  instance.next({ loops: false })

  assert.is(instance.location, instance.array.length - 1)
})

/* prev */
suite('previous() decrements the current location by 1 when distance is default', context => {
  const instance = context.setup({
    initialLocation: 1
  })

  instance.previous()

  assert.is(instance.location, 0)
})

suite('previous() decrements the current location by distance when distance is not default', context => {
  const instance = context.setup({
    initialLocation: 2,
  })

  instance.previous({ distance: 2 })

  assert.is(instance.location, 0)
})

suite('previous() loops back through the array by default when the current location is less than 0', context => {
  const instance = context.setup()

  instance.previous()

  assert.is(instance.location, instance.array.length - 1)
})

suite('previous() loops continuously through the array by default until current location is greater than or equal to 0', context => {
  const instance = context.setup()

  instance.previous({ distance: 15 })

  assert.is(instance.location, 0)
})

suite('previous() stops at 0 when loops is false AND decremented location is less than 0', context => {
  const instance = context.setup()

  instance.previous({ loops: false })

  assert.is(instance.location, 0)
})

suite('random() navigates to a random location', context => {
  const instance = context.setup()

  instance.random()

  assert.ok(instance.location >= 0 && instance.location <= instance.array.length)
})

/* status */
suite('status is "ready" after construction', context => {
  const instance = context.setup()

  assert.is(instance.status, 'ready')
})

suite('status is "navigated" after any navigation function is called at least once', context => {
  const navigate = context.setup(),
        next = context.setup(),
        previous = context.setup(),
        random = context.setup()

  navigate.random()
  next.random()
  previous.random()
  random.random()

  assert.ok([navigate, next, previous, random].every(instance => instance.status === 'navigated'))
})

/* method chaining */
suite('can method chain', context => {
  const instance = context.setup(),
        chained = instance
          .setArray(['Baleada'])
          .navigate(42)
          .next(42)
          .previous(42)

  assert.ok(chained instanceof Navigateable)
})

suite.run()
