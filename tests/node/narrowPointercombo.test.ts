import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { narrowPointercombo } from '../../src/extracted'

const suite = createSuite('narrowPointercombo')

suite(`narrows keycombo`, () => {
  const value = narrowPointercombo('shift+cmd+pointerdown'),
        expected = [
          'shift',
          'cmd',
          'pointerdown'
        ]

  assert.equal(value, expected)
})

suite.run()
