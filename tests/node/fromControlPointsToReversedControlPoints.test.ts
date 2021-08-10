import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { fromControlPointsToReversedControlPoints } from '../../src/classes/Animateable'

const suite = createSuite('fromControlPointsToReversedControlPoints')

suite(`transforms timing to control points`, () => {
  const value = fromControlPointsToReversedControlPoints([
          { x: 0.2, y: 0.3 },
          { x: 0.4, y: 0.5 },
        ]),
        expected = [
          { x: 0.6, y: 0.5 },
          { x: 0.8, y: 0.7 },
        ]

  assert.equal(value, expected)
})

suite.run()
