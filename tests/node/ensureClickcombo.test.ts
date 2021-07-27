import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { ensureClickcombo } from '../../src/extracted'

const suite = createSuite('ensureClickcombo')

suite(`ensures keycombo`, () => {
  const value = ensureClickcombo('shift+cmd+click'),
        expected = [
          'shift',
          'cmd',
          'click'
        ]

  assert.equal(value, expected)
})

suite.run()
