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

/* search */
test('search(query, options) updates results via default onSearch', t => {
  const instance = t.context.setup()

  instance.search('tortilla')

  t.assert(instance.results.length > 0)
})

test('emitters correctly emit', t => {
  let onSearch = 0

  const instance = t.context.setup({
    onSearch: () => (onSearch += 1)
  })

  instance.search('tortilla')

  t.deepEqual({ onSearch }, { onSearch: 1 })
})

/* method chaining */
test('can method chain', t => {
  const instance = t.context.setup(),
        chained = instance
          .setCandidates(['Baleada'])
          .setResults(['Baleada'])
          .search('Baleada')

  t.assert(chained instanceof Searchable)
})
