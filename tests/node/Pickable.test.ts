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

suite(`pick(...) ignores indices less than zero or greater than or equal to array length`, context => {
  const instance = context.setup()

  instance.pick([-1, 1, 42])

  assert.equal(instance.picks, [1])
})

suite(`pick(...) replaces picks when 'replace' is 'all'`, context => {
  const instance = context.setup()

  instance.pick([0, 1, 2, 3]).pick([1], { replace: 'all' })

  assert.equal(instance.picks, [1])
})

suite(`pick(...) ignores duplicate picks by default when 'replace' is 'all'`, context => {
  const instance = context.setup()

  instance.pick([0, 1, 2, 3]).pick([1, 1], { replace: 'all' })

  assert.equal(instance.picks, [1])
})

suite(`pick(...) optionally allows duplicate picks when 'replace' is 'all'`, context => {
  const instance = context.setup()

  instance.pick([0, 1, 2, 3]).pick([1, 1], { replace: 'all', allowsDuplicates: true })

  assert.equal(instance.picks, [1, 1])
})

suite(`pick(...) does not replace picks when 'replace' is 'none'`, context => {
  const instance = context.setup()

  instance.pick([0, 1, 2]).pick([3], { replace: 'none' })

  assert.equal(instance.picks, [0, 1, 2, 3])
})

suite(`pick(...) ignores duplicate picks by default when 'replace' is 'none'`, context => {
  const instance = context.setup()

  instance.pick([0, 1, 2, 3]).pick([1], { replace: 'none' })

  assert.equal(instance.picks, [0, 1, 2, 3])
})


suite(`pick(...) ignores duplicate 0 picks when 'replace' is 'none'`, context => {
  const instance = context.setup()
  
  instance.pick([0, 1, 2, 3]).pick([0], { replace: 'none' })
  
  assert.equal(instance.picks, [0, 1, 2, 3])
})

suite(`pick(...) optionally allows duplicate picks when 'replace' is 'none'`, context => {
  const instance = context.setup()

  instance.pick([0, 1, 2, 3]).pick([1], { replace: 'none', allowsDuplicates: true })

  assert.equal(instance.picks, [0, 1, 2, 3, 1])
})

suite(`pick(...) uses FIFO replacement when 'replace' is 'fifo' and replacement is shorter than current`, context => {
  const instance = context.setup()

  instance.pick([0, 1, 2]).pick([3], { replace: 'fifo' })

  assert.equal(instance.picks, [1, 2, 3])
})

suite(`pick(...) uses FIFO replacement when 'replace' is 'fifo' and replacement is the same length as current`, context => {
  const instance = context.setup()

  instance.pick([0, 1]).pick([2, 3], { replace: 'fifo' })

  assert.equal(instance.picks, [2, 3])
})

suite(`pick(...) uses FIFO replacement when 'replace' is 'fifo' and replacement is longer than current`, context => {
  const instance = context.setup()

  instance.pick([0, 1]).pick([2, 3, 4], { replace: 'fifo' })

  assert.equal(instance.picks, [3, 4])
})

suite(`pick(...) ignores duplicate picks by default when 'replace' is 'fifo'`, context => {
  const instance = context.setup()

  instance.pick([1, 2, 3]).pick([1], { replace: 'fifo' })

  assert.equal(instance.picks, [1, 2, 3])
})

suite(`pick(...) optionally allows duplicate picks when 'replace' is 'fifo'`, context => {
  const instance = context.setup()

  instance.pick([1, 2, 3]).pick([1], { replace: 'fifo', allowsDuplicates: true })

  assert.equal(instance.picks, [2, 3, 1])
})

suite(`pick(...) uses LIFO replacement when 'replace' is 'lifo' and replacement is shorter than current`, context => {
  const instance = context.setup()

  instance.pick([0, 1, 2]).pick([3], { replace: 'lifo' })

  assert.equal(instance.picks, [0, 1, 3])
})

suite(`pick(...) uses LIFO replacement when 'replace' is 'lifo' and replacement is the same length as current`, context => {
  const instance = context.setup()

  instance.pick([0, 1]).pick([2, 3], { replace: 'lifo' })

  assert.equal(instance.picks, [2, 3])
})

suite(`pick(...) uses LIFO replacement when 'replace' is 'lifo' and replacement is longer than current`, context => {
  const instance = context.setup()

  instance.pick([0, 1]).pick([2, 3, 4], { replace: 'lifo' })

  assert.equal(instance.picks, [2, 3])
})

suite(`pick(...) ignores duplicate picks by default when 'replace' is 'lifo'`, context => {
  const instance = context.setup()

  instance.pick([1, 2, 3]).pick([1], { replace: 'lifo' })

  assert.equal(instance.picks, [1, 2, 3])
})

suite(`pick(...) optionally allows duplicate picks when 'replace' is 'lifo'`, context => {
  const instance = context.setup()

  instance.pick([1, 2, 3]).pick([1], { replace: 'lifo', allowsDuplicates: true })

  assert.equal(instance.picks, [1, 2, 1])
})

suite(`omit(index) removes index from picked`, context => {
  const instance = context.setup()

  instance.pick([1, 2]).omit(2)

  assert.equal(instance.picks, [1])
})

suite(`omit(index) can remove falsey values`, context => {
  const instance = context.setup()

  instance.pick([0, 1]).omit(0)

  assert.equal(instance.picks, [1])
})

suite(`omit(indices) removes indices from picked`, context => {
  const instance = context.setup()

  instance.pick([1, 2]).pick([0, 3]).omit([1, 3])

  assert.equal(instance.picks, [2, 0])
})

suite(`omit(index) with 'reference' option set to 'picks' omits picks based on their position in the picks array`, context => {
  const instance = context.setup()

  instance.pick([1, 2]).pick([0, 3]).omit(0, { reference: 'picks' })

  assert.equal(instance.picks, [2, 0, 3])
})

suite(`omit() empties picked`, context => {
  const instance = context.setup()

  instance.pick([1, 2]).omit()

  assert.equal(instance.picks, [])
})

suite(`first retrieves first (as determined by the order of pickable.array) pick`, context => {
  const instance = context.setup(),
        value = instance.pick([1, 2, 0]).first,
        expected = 0

  assert.is(value, expected)
})

suite(`last retrieves last (as determined by the order of pickable.array) pick`, context => {
  const instance = context.setup(),
        value = instance.pick([1, 2, 0]).last,
        expected = 2

  assert.is(value, expected)
})

suite(`oldest retrieves first (as determined by the order of pickable.picks) pick`, context => {
  const instance = context.setup(),
        value = instance.pick([1, 2, 0]).oldest,
        expected = 1

  assert.is(value, expected)
})

suite(`newest retrieves last (as determined by the order of pickable.picks) pick`, context => {
  const instance = context.setup(),
        value = instance.pick([1, 2, 0]).newest,
        expected = 0

  assert.is(value, expected)
})

suite(`items retrieves items`, context => {
  const instance = context.setup()

  instance.pick([1, 2]).items

  assert.equal(instance.items, ['frijoles', 'mantequilla'])
})

suite(`multiple indicates whether or not multiple items have been picked`, context => {
  const instance = context.setup()

  assert.is(instance.multiple, false)
  assert.is(instance.pick([1, 2]).multiple, true)
  assert.is(instance.omit().multiple, false)
})

suite(`multiple considers unique picks only`, context => {
  const instance = context.setup()

  assert.is(instance.multiple, false)
  assert.is(instance.pick([1, 1], { allowsDuplicates: true }).multiple, false)
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
