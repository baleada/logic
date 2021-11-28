import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { Navigateable, NavigateableOptions } from '../../src/classes/Navigateable'

const suite = createSuite<{
  setup: (options?: NavigateableOptions) => Navigateable<string>
}>('Navigateable')

suite.before.each(context => {
  context.setup = (options = {}) => new Navigateable(
    ['tortilla', 'frijoles', 'mantequilla', 'aguacate', 'huevito'],
    options
  )
})

suite(`stores the array`, context => {
  const instance = context.setup()

  assert.equal(instance.array, ['tortilla', 'frijoles', 'mantequilla', 'aguacate', 'huevito'])
})

suite(`assignment sets the array`, context => {
  const instance = context.setup()
  instance.array = ['Baleada']

  assert.equal(instance.array, ['Baleada'])
})

suite(`setArray sets the array`, context => {
  const instance = context.setup()
  instance.setArray(['Baleada'])

  assert.equal(instance.array, ['Baleada'])
})

suite(`initial location is 0 by default`, context => {
  const instance = context.setup()

  assert.is(instance.location, 0)
})

suite(`initial location can be customized via options`, context => {
  const instance = context.setup({
    initialLocation: 1,
  })

  assert.is(instance.location, 1)
})

suite(`assignment sets the location`, context => {
  const instance = context.setup()

  instance.location = 1

  assert.is(instance.location, 1)
})

suite(`setLocation sets the location`, context => {
  const instance = context.setup()

  instance.setLocation(1)

  assert.is(instance.location, 1)
})

/* navigate */
suite(`navigate(newLocation) navigates to the last item in the array when newLocation is greater than the index of the last item in the array`, context => {
  const instance = context.setup()

  instance.navigate(42)

  assert.is(instance.location, instance.array.length - 1)
})

suite(`navigate(newLocation) navigates to 0 when newLocation is less than 0`, context => {
  const instance = context.setup()

  instance.navigate(-42)

  assert.is(instance.location, 0)
})

suite(`navigate(newLocation) navigates to newLocation`, context => {
  const instance = context.setup()

  instance.navigate(1)

  assert.is(instance.location, 1)
})

suite(`navigate(newLocation) navigates to 0 when array is empty`, context => {
  const instance = new Navigateable([]);

  (() => {
    instance.navigate(0)
    assert.is(instance.location, 0)
  })();
  
  (() => {
    instance.navigate(-42)
    assert.is(instance.location, 0)
  })();
  
  (() => {
    instance.navigate(42)
    assert.is(instance.location, 0)
  })()  
})

suite(`navigate() optionally allows impossible locations`, context => {
  const instance = context.setup();

  (() => {
    instance.navigate(42, { allow: 'any' })
    assert.is(instance.location, 42)
  })();
  
  (() => {
    instance.navigate(-42, { allow: 'any' })
    assert.is(instance.location, -42)
  })();
})

/* next */
suite(`next() increments the current location by 1 when distance is default`, context => {
  const instance = context.setup()

  instance.next()

  assert.is(instance.location, 1)
})

suite(`next() increments the current location by distance when distance is not default`, context => {
  const instance = context.setup()

  instance.next({ distance: 2, })

  assert.is(instance.location, 2)
})

suite(`next() loops back through the array by default when the current location is greater than the last location`, context => {
  const instance = context.setup()

  instance.navigate(instance.array.length - 1)
  instance.next()

  assert.is(instance.location, 0)
})

suite(`next() loops continuously through the array by default until current location is less than or equal to the last location`, context => {
  const instance = context.setup()

  instance.next({ distance: 15 })

  assert.is(instance.location, 0)
})

suite(`next() stops at the last location when loops is false AND incremented location is greater than the last location`, context => {
  const instance = context.setup()

  instance.navigate(instance.array.length - 1)
  instance.next({ loops: false })

  assert.is(instance.location, instance.array.length - 1)
})

/* previous */
suite(`previous() decrements the current location by 1 when distance is default`, context => {
  const instance = context.setup({
    initialLocation: 1
  })

  instance.previous()

  assert.is(instance.location, 0)
})

suite(`previous() decrements the current location by distance when distance is not default`, context => {
  const instance = context.setup({
    initialLocation: 2,
  })

  instance.previous({ distance: 2 })

  assert.is(instance.location, 0)
})

suite(`previous() loops back through the array by default when the current location is less than 0`, context => {
  const instance = context.setup()

  instance.previous()

  assert.is(instance.location, instance.array.length - 1)
})

suite(`previous() loops continuously through the array by default until current location is greater than or equal to 0`, context => {
  const instance = context.setup()

  instance.previous({ distance: 15 })

  assert.is(instance.location, 0)
})

suite(`previous() stops at 0 when loops is false AND decremented location is less than 0`, context => {
  const instance = context.setup()

  instance.previous({ loops: false })

  assert.is(instance.location, 0)
})

suite(`random() navigates to a random location`, context => {
  const instance = context.setup()

  instance.random()

  assert.ok(instance.location >= 0 && instance.location <= instance.array.length)
})

suite(`first() navigates to first item`, context => {
  const instance = context.setup()

  instance.first()

  assert.is(instance.location, 0)
})

suite(`last() navigates to last item`, context => {
  const instance = context.setup()

  instance.last()

  assert.is(instance.location, instance.array.length - 1)
})

suite(`status is 'ready' after construction`, context => {
  const instance = context.setup()

  assert.is(instance.status, 'ready')
})

suite(`status is 'navigated' after navigate(...)`, context => {
  const instance = context.setup()
  
  instance.navigate(1)
  
  assert.is(instance.status, 'navigated')
})

suite(`status is 'navigated to next' after next(...)`, context => {
  const instance = context.setup()
  
  instance.next()
  
  assert.is(instance.status, 'navigated to next')
})

suite(`status is 'navigated to previous' after previous(...)`, context => {
  const instance = context.setup()
  
  instance.previous()
  
  assert.is(instance.status, 'navigated to previous')
})

suite(`status is 'navigated to random' after random(...)`, context => {
  const instance = context.setup()
  
  instance.random()
  
  assert.is(instance.status, 'navigated to random')
})

suite(`status is 'navigated to first' after first(...)`, context => {
  const instance = context.setup()
  
  instance.first()
  
  assert.is(instance.status, 'navigated to first')
})

suite(`status is 'navigated to last' after last(...)`, context => {
  const instance = context.setup()
  
  instance.last()
  
  assert.is(instance.status, 'navigated to last')
})


suite.run()
