import test from 'ava'
import Searchable from '../../src/classes/Searchable'

test.beforeEach(t => {
  t.context.setup = (options = {}) => new Searchable(
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

/* search */
test('search(query) updates results', t => {
  const instance = t.context.setup()

  instance.search('tortilla')

  t.assert(instance.results.length > 0)
})

test('search(query) includes item in results when resultsIncludeItem is true', t => {
  const instance = t.context.setup({
    resultsIncludeItem: true
  })

  instance.search('tortilla')

  t.assert(instance.results[0].hasOwnProperty('item'))
})

test('search(query) includes match position in results when resultsIncludePosition is true', t => {
  const instance = t.context.setup({
    resultsIncludePosition: true
  })

  instance.search('tortilla')

  t.assert(instance.results[0].matchData.metadata.tortilla.id.position.length > 0)
})

/* method chaining */
test('can method chain', t => {
  const instance = t.context.setup(),
        chained = instance
          .setArray(['Baleada'])
          .setResults(['Baleada'])
          .search('Baleada')

  t.assert(chained instanceof Searchable)
})
