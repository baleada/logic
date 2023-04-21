import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { narrowMousecombo } from '../../src/extracted'

const suite = createSuite('narrowMousecombo')

suite(`narrows keycombo`, () => {
  const value = narrowMousecombo('shift+cmd+click'),
        expected = [
          'shift',
          'cmd',
          'click'
        ]

  assert.equal(value, expected)
})

suite.run()
