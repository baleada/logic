import test from 'ava'
import Navigable from '../../src/libraries/Navigable'
import enumerable from '../fixtures/enumerable.json'

test.beforeEach(t => {
  t.context.setup = (options = {}) => new Navigable([
    'tortilla',
    'frijoles',
    'mantequilla',
    'aguacate',
    'huevito',
  ], options)
})

/* Basic */
test('enumerables match intended enumerables', t => {
  const instance = t.context.setup()

  t.is(enumerable.Navigable.every(key => Object.keys(instance).includes(key)), true)
})

test('stores the array', t => {
  const instance = t.context.setup()

  t.deepEqual(instance.array, ['tortilla',
      'frijoles',
      'mantequilla',
      'aguacate',
      'huevito',
    ]
  )
})

test('setArray sets the array', t => {
  const instance = t.context.setup()

  instance.setArray(['Baleada'])

  t.deepEqual(instance.array, ['Baleada'])
})

test('initial currentIndex when startIndex is default', t => {
  const instance = t.context.setup()

  t.is(instance.currentIndex, 0)
})

test('initial currentIndex is 42 when startIndex is 42', t => {
  const instance = t.context.setup({
    startIndex: 42,
  })

  t.is(instance.currentIndex, 42)
})

test('setCurrentIndex sets the current index', t => {
  const instance = t.context.setup()

  instance.setCurrentIndex(42)

  t.is(instance.currentIndex, 42)
})


/* goTo */
test('goTo(newIndex) sets the current index to the length of the array when newIndex is greater than the length of the array', t => {
  const instance = t.context.setup({
    onNavigate: newIndex => instance.setCurrentIndex(newIndex)
  })

  instance.goTo(42)

  t.is(instance.currentIndex, instance.array.length)
})

test('goTo(newIndex) sets the current index to 0 when newIndex is less than 0', t => {
  const instance = t.context.setup()

  instance.goTo(-42)

  t.is(instance.currentIndex, 0)
})

test('goTo(newIndex) sets the current index to newIndex', t => {
  const instance = t.context.setup()

  instance.goTo(1)

  t.is(instance.currentIndex, 1)
})

/* next */
test('next() increments the current index by 1 when increment is default', t => {
  const instance = t.context.setup()

  instance.next()

  t.is(instance.currentIndex, 1)
})

test('next() increments the current index by 2 when increment is 2', t => {
  const instance = t.context.setup({
    increment: 2
  })

  instance.next()

  t.is(instance.currentIndex, 2)
})

test('next() loops back through the array by default when the current index is greater than the last index', t => {
  const instance = t.context.setup()

  instance.setCurrentIndex(instance.array.length - 1)
  instance.next()

  t.is(instance.currentIndex, 0)
})

test('next() loops recursively through the array by default until current index is less than or equal to the last index', t => {
  const instance = t.context.setup({
    increment: 15
  })

  instance.next()

  t.is(instance.currentIndex, 0)
})

test('next() stops at the last index when loops is false AND incremented index is greater than the last index', t => {
  const instance = t.context.setup({
    loops: false
  })

  instance.setCurrentIndex(instance.array.length - 1)
  instance.next()

  t.is(instance.currentIndex, instance.array.length - 1)
})


/* prev */
test('prev() decrements the current index by 1 when decrement is default', t => {
  const instance = t.context.setup()

  instance.setCurrentIndex(1)
  instance.prev()

  t.is(instance.currentIndex, 0)
})

test('prev() decrements the current index by 2 when decrement is 2', t => {
  const instance = t.context.setup({
    decrement: 2
  })

  instance.setCurrentIndex(2)
  instance.prev()

  t.is(instance.currentIndex, 0)
})

test('prev() loops back through the array by default when the current index is less than 0', t => {
  const instance = t.context.setup()

  instance.prev()

  t.is(instance.currentIndex, instance.array.length - 1)
})

test('prev() loops recursively through the array by default until current index is greater than or equal to 0', t => {
  const instance = t.context.setup({
    decrement: 15
  })

  instance.prev()

  t.is(instance.currentIndex, 0)
})

test('prev() stops at 0 when loops is false AND decremented index is less than 0', t => {
  const instance = t.context.setup({
    loops: false
  })

  instance.prev()

  t.is(instance.currentIndex, 0)
})


/* method chaining */
test('can method chain', t => {
  const instance = t.context.setup()
  const chained = instance
    .setArray(['Baleada'])
    .setCurrentIndex(0)
    .goTo(42)
    .next()
    .prev()

  t.assert(chained instanceof Navigable)
})
