import test from 'ava'
import Navigable from '../../src/libraries/Navigable'

test.beforeEach(t => {
  t.context.setup = (options = {}) => new Navigable(
    [
      'tortilla',
      'frijoles',
      'mantequilla',
      'aguacate',
      'huevito',
    ],
    {
      onNavigate: (index, instance) => instance.setIndex(index),
      ...options
    }
  )
})

/* Basic */
test('stores the array', t => {
  const options = {}
  const instance = t.context.setup(options)
  const expected = new Navigable(['tortilla', 'frijoles', 'mantequilla', 'aguacate', 'huevito'], options)

  t.deepEqual(instance, expected)
})

test('set sets the array', t => {
  const options = {}
  let instance = t.context.setup(options)

  instance = instance.set(['Baleada'])

  const expected = new Navigable(['Baleada'], options)

  t.deepEqual(instance, expected)
})

test('initial index is 0 when initialIndex is default', t => {
  const options = {}
  const instance = t.context.setup(options)

  t.is(instance.index, 0)
})

test('initial index is 42 when initialIndex is 42', t => {
  const options = {}
  const instance = t.context.setup({
    initialIndex: 42,
  })

  t.is(instance.index, 42)
})

test('setIndex sets the current index', t => {
  const options = {}
  const instance = t.context.setup(options)

  instance.setIndex(42)

  t.is(instance.index, 42)
})


/* goTo */
test('goTo(newIndex) navigate to the length of the array when newIndex is greater than the length of the array', t => {
  const options = {}
  const instance = t.context.setup(options)

  instance.goTo(42)

  t.is(instance.index, instance.length)
})

test('goTo(newIndex) navigates to 0 when newIndex is less than 0', t => {
  const options = {}
  const instance = t.context.setup(options)

  instance.goTo(-42)

  t.is(instance.index, 0)
})

test('goTo(newIndex) navigates to newIndex', t => {
  const options = {}
  const instance = t.context.setup(options)

  instance.goTo(1)

  t.is(instance.index, 1)
})

/* next */
test('next() increments the current index by 1 when increment is default', t => {
  const options = {}
  const instance = t.context.setup(options)

  instance.next()

  t.is(instance.index, 1)
})

test('next() increments the current index by 2 when increment is 2', t => {
  const options = {
    increment: 2,
  }
  const instance = t.context.setup(options)

  instance.next()

  t.is(instance.index, 2)
})

test('next() loops back through the array by default when the current index is greater than the last index', t => {
  const options = {}
  const instance = t.context.setup(options)

  instance.setIndex(instance.length - 1)
  instance.next()

  t.is(instance.index, 0)
})

test('next() loops recursively through the array by default until current index is less than or equal to the last index', t => {
  const options = {
    increment: 15
  }
  const instance = t.context.setup(options)

  instance.next()

  t.is(instance.index, 0)
})

test('next() stops at the last index when loops is false AND incremented index is greater than the last index', t => {
  const options = {
    loops: false
  }
  const instance = t.context.setup(options)

  instance.setIndex(instance.length - 1)
  instance.next()

  t.is(instance.index, instance.length - 1)
})


/* prev */
test('prev() decrements the current index by 1 when decrement is default', t => {
  const options = {}
  const instance = t.context.setup(options)

  instance.setIndex(1)
  instance.prev()

  t.is(instance.index, 0)
})

test('prev() decrements the current index by 2 when decrement is 2', t => {
  const options = {
    decrement: 2
  }
  const instance = t.context.setup(options)

  instance.setIndex(2)
  instance.prev()

  t.is(instance.index, 0)
})

test('prev() loops back through the array by default when the current index is less than 0', t => {
  const options = {}
  const instance = t.context.setup(options)

  instance.prev()

  t.is(instance.index, instance.length - 1)
})

test('prev() loops recursively through the array by default until current index is greater than or equal to 0', t => {
  const options = {
    decrement: 15
  }
  const instance = t.context.setup(options)

  instance.prev()

  t.is(instance.index, 0)
})

test('prev() stops at 0 when loops is false AND decremented index is less than 0', t => {
  const options = {
    loops: false
  }
  const instance = t.context.setup(options)

  instance.prev()

  t.is(instance.index, 0)
})


/* method chaining */
test('can method chain', t => {
  const options = {}
  const instance = t.context.setup(options)
  const chained = instance
    .set(['Baleada'])
    .setIndex(0)
    .goTo(42)
    .next()
    .prev()

  t.assert(chained instanceof Navigable)
})
