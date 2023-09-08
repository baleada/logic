import BezierEasing from 'bezier-easing'
import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { createAnimationProgress } from '../../src/classes/Animateable'

const suite = createSuite('createAnimationProgress')

suite(`creates easing function`, () => {
  const value = Math.round(createAnimationProgress([{ x: .2, y: .3 }, { x: .4, y: .5 }])(0.5) * 1000),
        expected = 568

  assert.is(value, expected)  
})

suite.run()
