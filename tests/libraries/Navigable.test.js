import test from 'ava'
import Navigable from '../../src/libraries/Navigable'

test.beforeEach(t => {
  t.context.setup = (options = {}) => new Navigable(
    ['tortilla', 'frijoles', 'mantequilla', 'aguacate', 'huevito'],
    options
  )
})

/* Basic */
test('stores the array', t => {
  const instance = t.context.setup()

  t.deepEqual(instance.array, ['tortilla', 'frijoles', 'mantequilla', 'aguacate', 'huevito'])
})

test('setArray sets the array', t => {
  const instance = t.context.setup()
  instance.setArray(['Baleada'])

  t.deepEqual(instance.array, ['Baleada'])
})


/* goTo */
test('goTo(newLocation) navigate to the length of the array when newLocation is greater than the length of the array', t => {
  const instance = t.context.setup()

  instance.goTo(42)

  t.is(instance.location, instance.array.length)
})

test('goTo(newLocation) navigates to 0 when newLocation is less than 0', t => {
  const instance = t.context.setup()

  instance.goTo(-42)

  t.is(instance.location, 0)
})

test('goTo(newLocation) navigates to newLocation', t => {
  const instance = t.context.setup()

  instance.goTo(1)

  t.is(instance.location, 1)
})

/* next */
test('next() increments the current location by 1 when increment is default', t => {
  const instance = t.context.setup()

  instance.next()

  t.is(instance.location, 1)
})

test('next() increments the current location by increment when increment is not default', t => {
  const instance = t.context.setup({
    increment: 2,
  })

  instance.next()

  t.is(instance.location, 2)
})

test('next() loops back through the array by default when the current location is greater than the last location', t => {
  const instance = t.context.setup()

  instance.goTo(instance.array.length - 1)
  instance.next()

  t.is(instance.location, 0)
})

test('next() loops recursively through the array by default until current location is less than or equal to the last location', t => {
  const instance = t.context.setup({
    increment: 15
  })

  instance.next()

  t.is(instance.location, 0)
})

test('next() stops at the last location when loops is false AND incremented location is greater than the last location', t => {
  const instance = t.context.setup({
    loops: false
  })

  instance.goTo(instance.array.length - 1)
  instance.next()

  t.is(instance.location, instance.array.length - 1)
})


/* prev */
test('prev() decrements the current location by 1 when decrement is default', t => {
  const instance = t.context.setup({
    initialLocation: 1
  })

  instance.prev()

  t.is(instance.location, 0)
})

test('prev() decrements the current location by decrement when decrement is not default', t => {
  const instance = t.context.setup({
    initialLocation: 2,
    decrement: 2
  })

  instance.prev()

  t.is(instance.location, 0)
})

test('prev() loops back through the array by default when the current location is less than 0', t => {
  const instance = t.context.setup()

  instance.prev()

  t.is(instance.location, instance.array.length - 1)
})

test('prev() loops recursively through the array by default until current location is greater than or equal to 0', t => {
  const instance = t.context.setup({
    decrement: 15
  })

  instance.prev()

  t.is(instance.location, 0)
})

test('prev() stops at 0 when loops is false AND decremented location is less than 0', t => {
  const instance = t.context.setup({
    loops: false
  })

  instance.prev()

  t.is(instance.location, 0)
})


/* method chaining */
test('can method chain', t => {
  const instance = t.context.setup()
  const chained = instance
    .setArray(['Baleada'])
    .goTo(42)
    .next(42)
    .prev(42)

  t.assert(chained instanceof Navigable)
})
