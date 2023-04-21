import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { narrowKeycombo } from '../../src/extracted'

const suite = createSuite('narrowKeycombo')

suite(`narrows keycombo`, () => {
  const value = narrowKeycombo('shift+cmd+b'),
        expected = [
          { name: 'shift', type: 'modifier' },
          { name: 'cmd', type: 'modifier' },
          { name: 'b', type: 'singleCharacter' },
        ]

  assert.equal(value, expected)
})

suite.run()
