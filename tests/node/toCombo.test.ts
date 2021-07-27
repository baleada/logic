import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { toCombo } from '../../src/extracted'

const suite = createSuite('toCombo')

suite(`creates combo`, () => {
  const value = toCombo('shift+cmd+b'),
        expected = [
          'shift',
          'cmd',
          'b'
        ]

  assert.equal(value, expected)
})

suite.run()
