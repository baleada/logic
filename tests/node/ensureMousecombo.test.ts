import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { ensureMousecombo } from '../../src/extracted'

const suite = createSuite('ensureMousecombo')

suite(`ensures keycombo`, () => {
  const value = ensureMousecombo('shift+cmd+click'),
        expected = [
          'shift',
          'cmd',
          'click'
        ]

  assert.equal(value, expected)
})

suite.run()
