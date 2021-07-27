import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { ensureKeycombo } from '../../src/extracted'

const suite = createSuite('ensureKeycombo')

suite(`ensures keycombo`, () => {
  const value = ensureKeycombo('shift+cmd+b'),
        expected = [
          { name: 'shift', type: 'modifier' },
          { name: 'cmd', type: 'modifier' },
          { name: 'b', type: 'singleCharacter' },
        ]

  assert.equal(value, expected)
})

suite.run()
