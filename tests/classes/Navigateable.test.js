import test from 'ava'
import { Navigateable } from '../../lib/index.esm.js'

test.beforeEach(t => {
  t.context.setup = (options = {}) => new Navigateable(
    ['tortilla', 'frijoles', 'mantequilla', 'aguacate', 'huevito'],
    options
  )
})

test('stores the array', t => {
  const instance = t.context.setup()

  t.deepEqual(instance.array, ['tortilla', 'frijoles', 'mantequilla', 'aguacate', 'huevito'])
})

test('assignment sets the array', t => {
  const instance = t.context.setup()
  instance.array = ['Baleada']

  t.deepEqual(instance.array, ['Baleada'])
})

test('setArray sets the array', t => {
  const instance = t.context.setup()
  instance.setArray(['Baleada'])

  t.deepEqual(instance.array, ['Baleada'])
})

test('initial location is 0 by default', t => {
  const instance = t.context.setup()

  t.is(instance.location, 0)
})

test('initial location can be customized via options', t => {
  const instance = t.context.setup({
    initialLocation: 1,
  })

  t.is(instance.location, 1)
})

test('assignment sets the location', t => {
  const instance = t.context.setup()

  instance.location = 1

  t.is(instance.location, 1)
})

test('setLocation sets the location', t => {
  const instance = t.context.setup()

  instance.setLocation(1)

  t.is(instance.location, 1)
})

/* navigate */
test('navigate(newLocation) navigates to the last item in the array when newLocation is greater than the index of the last item in the array', t => {
  const instance = t.context.setup()

  instance.navigate(42)

  t.is(instance.location, instance.array.length - 1)
})

test('navigate(newLocation) navigates to 0 when newLocation is less than 0', t => {
  const instance = t.context.setup()

  instance.navigate(-42)

  t.is(instance.location, 0)
})

test('navigate(newLocation) navigates to newLocation', t => {
  const instance = t.context.setup()

  instance.navigate(1)

  t.is(instance.location, 1)
})

/* next */
test('next() increments the current location by 1 when distance is default', t => {
  const instance = t.context.setup()

  instance.next()

  t.is(instance.location, 1)
})

test('next() increments the current location by distance when distance is not default', t => {
  const instance = t.context.setup()

  instance.next({ distance: 2, })

  t.is(instance.location, 2)
})

test('next() loops back through the array by default when the current location is greater than the last location', t => {
  const instance = t.context.setup()

  instance.navigate(instance.array.length - 1)
  instance.next()

  t.is(instance.location, 0)
})

test('next() loops continuously through the array by default until current location is less than or equal to the last location', t => {
  const instance = t.context.setup()

  instance.next({ distance: 15 })

  t.is(instance.location, 0)
})

test('next() stops at the last location when loops is false AND incremented location is greater than the last location', t => {
  const instance = t.context.setup()

  instance.navigate(instance.array.length - 1)
  instance.next({ loops: false })

  t.is(instance.location, instance.array.length - 1)
})

/* prev */
test('previous() decrements the current location by 1 when distance is default', t => {
  const instance = t.context.setup({
    initialLocation: 1
  })

  instance.previous()

  t.is(instance.location, 0)
})

test('previous() decrements the current location by distance when distance is not default', t => {
  const instance = t.context.setup({
    initialLocation: 2,
  })

  instance.previous({ distance: 2 })

  t.is(instance.location, 0)
})

test('previous() loops back through the array by default when the current location is less than 0', t => {
  const instance = t.context.setup()

  instance.previous()

  t.is(instance.location, instance.array.length - 1)
})

test('previous() loops continuously through the array by default until current location is greater than or equal to 0', t => {
  const instance = t.context.setup()

  instance.previous({ distance: 15 })

  t.is(instance.location, 0)
})

test('previous() stops at 0 when loops is false AND decremented location is less than 0', t => {
  const instance = t.context.setup()

  instance.previous({ loops: false })

  t.is(instance.location, 0)
})

test('random() navigates to a random location', t => {
  const instance = t.context.setup()

  instance.random()

  t.assert(instance.location >= 0 && instance.location <= instance.array.length)
})

/* status */
test('status is "ready" after construction', t => {
  const instance = t.context.setup()

  t.is(instance.status, 'ready')
})

test('status is "navigated" after any navigation function is called at least once', t => {
  const navigate = t.context.setup(),
        next = t.context.setup(),
        previous = t.context.setup(),
        random = t.context.setup()

  navigate.random()
  next.random()
  previous.random()
  random.random()

  t.assert([navigate, next, previous, random].every(instance => instance.status === 'navigated'))
})

/* method chaining */
test('can method chain', t => {
  const instance = t.context.setup(),
        chained = instance
          .setArray(['Baleada'])
          .navigate(42)
          .next(42)
          .previous(42)

  t.assert(chained instanceof Navigateable)
})
