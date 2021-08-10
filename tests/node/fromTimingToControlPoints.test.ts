import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { fromTimingToControlPoints } from '../../src/classes/Animateable'

const suite = createSuite('fromTimingToControlPoints')

suite(`transforms timing to control points`, () => {
  const value = fromTimingToControlPoints([0, 0, 1, 1]),
        expected = [
          { x: 0, y: 0 },
          { x: 1, y: 1 },
        ]

  assert.equal(value, expected)
})

suite.run()
