import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { Pickable, PickableOptions } from '../../src/classes/Pickable'

const suite = createSuite<{
  setup: (options?: PickableOptions) => Pickable<string>
}>('Pickable')

suite.before.each(context => {
  context.setup = (options = {}) => new Pickable(
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

suite(`initial picked is empty by default`, context => {
  const instance = context.setup()

  assert.equal(instance.picks, [])
})

suite(`initial picked can be customized via options`, context => {
  const instance = context.setup({
    initialPicks: [1],
  })

  assert.equal(instance.picks, [1])
})

suite(`assignment sets picked`, context => {
  const instance = context.setup()

  instance.picks = [1]

  assert.equal(instance.picks, [1])
})

suite(`setPicks sets picked`, context => {
  const instance = context.setup()

  instance.setPicks(1)

  assert.equal(instance.picks, [1])
})

suite(`pick(index) appends index to array`, context => {
  const instance = context.setup()

  instance.pick(1)

  assert.equal(instance.picks, [1])
})

suite(`pick(indices) appends indices to picked, in original order`, context => {
  const instance = context.setup()

  instance.pick([1, 2]).pick([0, 3])

  assert.equal(instance.picks, [1, 2, 0, 3])
})

suite(`pick(indices) ignores indices less than zero or greater than or equal to array length`, context => {
  const instance = context.setup()

  instance.pick([-1, 1, 42])

  assert.equal(instance.picks, [1])
})

suite(`omit(index) removes index from picked`, context => {
  const instance = context.setup()

  instance.pick([1, 2]).omit(2)

  assert.equal(instance.picks, [1])
})

suite(`omit(indices) removes indices from picked`, context => {
  const instance = context.setup()

  instance.pick([1, 2]).pick([0, 3]).omit([1, 3])

  assert.equal(instance.picks, [2, 0])
})

suite(`omit() empties picked`, context => {
  const instance = context.setup()

  instance.pick([1, 2]).omit()

  assert.equal(instance.picks, [])
})

suite(`items retrieves items`, context => {
  const instance = context.setup()

  instance.pick([1, 2]).items

  assert.equal(instance.items, ['frijoles', 'mantequilla'])
})

suite(`pickedMultiple indicates whether or not multiple items have been picked`, context => {
  const instance = context.setup()

  assert.is(instance.multiple, false)
  assert.is(instance.pick([1, 2]).multiple, true)
  assert.is(instance.omit().multiple, false)
})

suite(`status is 'ready' after construction`, context => {
  const instance = context.setup()

  assert.is(instance.status, 'ready')
})

suite(`status is 'picked' after pick(...)`, context => {
  const instance = context.setup()

  instance.pick(1)

  assert.is(instance.status, 'picked')
})

suite(`status is 'omitted' after omit(...)`, context => {
  const instance = context.setup()

  instance.omit()

  assert.is(instance.status, 'omitted')
  
})

suite.run()
