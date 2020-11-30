import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { Searchable } from '../fixtures/TEST_BUNDLE.js'

const suite = createSuite('Searchable (node)')

suite.before.each(context => {
  context.setup = (options = {}) => new Searchable(
    ['tortilla', 'frijoles', 'mantequilla', 'aguacate', 'huevito'],
    options
  )
})

/* Basic */
suite('stores the candidates', context => {
  const instance = context.setup()

  assert.equal(instance.candidates, ['tortilla', 'frijoles', 'mantequilla', 'aguacate', 'huevito'])
})

suite('assignment sets the candidates', context => {
  const instance = context.setup()
  instance.candidates = ['Baleada']

  assert.equal(instance.candidates, ['Baleada'])
})

suite('setCandidates sets the candidates', context => {
  const instance = context.setup()
  instance.setCandidates(['Baleada'])

  assert.equal(instance.candidates, ['Baleada'])
})

suite('setCandidates constructs the searcher', context => {
  const instance = context.setup()
  instance.setCandidates(['Baleada'])

  assert.ok(instance.trie)
})

suite('results is empty after construction', context => {
  const instance = context.setup()

  assert.equal(instance.results, [])
})

/* search */
suite('search(query, options) updates results', context => {
  const instance = context.setup()

  instance.search('tortilla')

  assert.ok(instance.results.length > 0)
})

/* status */
suite('status is "ready" after construction', context => {
  const instance = context.setup()

  assert.is(instance.status, 'ready')
})

suite('status is "searched" after search(...) is called at least once', context => {
  const instance = context.setup()

  instance.search('Baleada')

  assert.is(instance.status, 'searched')
})

/* method chaining */
suite('can method chain', context => {
  const instance = context.setup(),
        chained = instance
          .setCandidates(['Baleada'])
          .search('Baleada')

  assert.ok(chained instanceof Searchable)
})

suite.run()
