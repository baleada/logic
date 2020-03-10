import test from 'ava'
import Searchable from '../../src/classes/Searchable'
import { Searcher } from 'fast-fuzzy'

test.beforeEach(t => {
  t.context.setup = (options = {}) => new Searchable(
    ['tortilla', 'frijoles', 'mantequilla', 'aguacate', 'huevito'],
    options
  )
})

/* Basic */
test('stores the candidates', t => {
  const instance = t.context.setup()

  t.deepEqual(instance.candidates, ['tortilla', 'frijoles', 'mantequilla', 'aguacate', 'huevito'])
})

test('assignment sets the candidates', t => {
  const instance = t.context.setup()
  instance.candidates = ['Baleada']

  t.deepEqual(instance.candidates, ['Baleada'])
})

test('setCandidates sets the candidates', t => {
  const instance = t.context.setup()
  instance.setCandidates(['Baleada'])

  t.deepEqual(instance.candidates, ['Baleada'])
})

test('setCandidates constructs the searcher', t => {
  const instance = t.context.setup()
  instance.setCandidates(['Baleada'])

  t.assert(instance._searcher instanceof Searcher)
})

test('results is empty after construction', t => {
  const instance = t.context.setup()

  t.deepEqual(instance.results, [])
})

/* search */
test('search(query, options) updates results', t => {
  const instance = t.context.setup()

  instance.search('tortilla')

  t.assert(instance.results.length > 0)
})

/* status */
test('status is "ready" after construction', t => {
  const instance = t.context.setup()

  t.is(instance.status, 'ready')
})

test('status is "searched" after search(...) is called at least once', t => {
  const instance = t.context.setup()

  instance.search('Baleada')

  t.is(instance.status, 'searched')
})

/* method chaining */
test('can method chain', t => {
  const instance = t.context.setup(),
        chained = instance
          .setCandidates(['Baleada'])
          .search('Baleada')

  t.assert(chained instanceof Searchable)
})
