import test from 'ava'
import Navigable from '../../src/libraries/Navigable'

test.beforeEach(t => {
  t.context.state = ['tortilla', 'frijoles', 'mantequilla', 'aguacate', 'huevito']
  t.context.setup = (options = {}) => new Navigable(
    t.context.state,
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
  let location = 0
  const instance = t.context.setup({
    onNavigate: newLocation => location = newLocation
  })

  instance.goTo(42)

  t.is(location, instance.array.length)
})

test('goTo(newLocation) navigates to 0 when newLocation is less than 0', t => {
  let location = 0
  const instance = t.context.setup({
    onNavigate: newLocation => location = newLocation
  })

  instance.goTo(-42)

  t.is(location, 0)
})

test('goTo(newLocation) navigates to newLocation', t => {
  let location = 0
  const instance = t.context.setup({
    onNavigate: newLocation => location = newLocation
  })

  instance.goTo(1)

  t.is(location, 1)
})

/* next */
test('next(location) increments the current location by 1 when increment is default', t => {
  let location = 0
  const instance = t.context.setup({
    onNavigate: newLocation => location = newLocation
  })

  instance.next(location)

  t.is(location, 1)
})

test('next(location) increments the current location by increment when increment is not default', t => {
  let location = 0
  const instance = t.context.setup({
    onNavigate: newLocation => location = newLocation,
    increment: 2,
  })

  instance.next(location)

  t.is(location, 2)
})

test('next(location) loops back through the array by default when the current location is greater than the last location', t => {
  let location = t.context.state.length - 1
  const instance = t.context.setup({
    onNavigate: newLocation => location = newLocation
  })

  instance.next(location)

  t.is(location, 0)
})

test('next(location) loops recursively through the array by default until current location is less than or equal to the last location', t => {
  let location = 0
  const instance = t.context.setup({
    onNavigate: newLocation => location = newLocation,
    increment: 15
  })

  instance.next(location)

  t.is(location, 0)
})

test('next(location) stops at the last location when loops is false AND incremented location is greater than the last location', t => {
  let location = t.context.state.length - 1
  const instance = t.context.setup({
    onNavigate: newLocation => location = newLocation,
    loops: false
  })

  instance.next(location)

  t.is(location, instance.array.length - 1)
})


/* prev */
test('prev(location) decrements the current location by 1 when decrement is default', t => {
  let location = 1
  const instance = t.context.setup({
    onNavigate: newLocation => location = newLocation
  })

  instance.prev(location)

  t.is(location, 0)
})

test('prev(location) decrements the current location by decrement when decrement is not default', t => {
  let location = 2
  const instance = t.context.setup({
    onNavigate: newLocation => location = newLocation,
    decrement: 2
  })

  instance.prev(location)

  t.is(location, 0)
})

test('prev(location) loops back through the array by default when the current location is less than 0', t => {
  let location = 0
  const instance = t.context.setup({
    onNavigate: newLocation => location = newLocation
  })

  instance.prev(location)

  t.is(location, instance.array.length - 1)
})

test('prev(location) loops recursively through the array by default until current location is greater than or equal to 0', t => {
  let location = 0
  const instance = t.context.setup({
    onNavigate: newLocation => location = newLocation,
    decrement: 15
  })

  instance.prev(location)

  t.is(location, 0)
})

test('prev(location) stops at 0 when loops is false AND decremented location is less than 0', t => {
  let location = 0
  const instance = t.context.setup({
    onNavigate: newLocation => location = newLocation,
    loops: false
  })

  instance.prev(location)

  t.is(location, 0)
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
