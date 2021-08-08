import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { ensurePointercombo } from '../../src/extracted'

const suite = createSuite('ensurePointercombo')

suite(`ensures keycombo`, () => {
  const value = ensurePointercombo('shift+cmd+pointerdown'),
        expected = [
          'shift',
          'cmd',
          'pointerdown'
        ]

  assert.equal(value, expected)
})

suite.run()
