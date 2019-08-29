import test from 'ava'
import Reorderable from '../../src/libraries/Reorderable'

test.beforeEach(t => {
  t.context.setup = (options = {}) => new Reorderable(
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


/* reorder */
test('reorder(itemIndex, newIndex) emits reordered array through onReorder', t => {
  let array = []
  const instance = t.context.setup({
    onReorder: reorderedArray => array = reorderedArray
  })

  instance.reorder(0, 1)

  t.deepEqual(array, ['frijoles', 'tortilla', 'mantequilla', 'aguacate', 'huevito'])
})


/* method chaining */
test('can method chain', t => {
  const instance = t.context.setup()
  const chained = instance
    .setArray(['Baleada', 'logic'])
    .reorder(0, 1)

  t.assert(chained instanceof Reorderable)
})
