import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withMethods, deleteable,  uniqueable, clipable, slugable } from '../../lib/index.js'

const suite = createSuite('withMethods (node)')

suite(`adds array methods`, context => {
  const stub = ['tortilla', 'frijoles', 'mantequilla', 'aguacate', 'huevito', 'baleada', 'baleada', 'baleada'],
        value = withMethods({ deleteable, uniqueable }, stub)
          .delete({ index: 0 })
          .unique()
          .value,
        expected = ['frijoles', 'mantequilla', 'aguacate', 'huevito', 'baleada']
  
  assert.equal(value, expected)
})

suite(`adds string methods`, context => {
  const stub = 'Baleada: a toolkit for building web apps',
        value = withMethods({ clipable, slugable }, stub)
          .clip(' for building web apps')
          .slug()
          .value,
        expected = 'baleada-a-toolkit'
  
  assert.is(value, expected)
})

suite.run()
