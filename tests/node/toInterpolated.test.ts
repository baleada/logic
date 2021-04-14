import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { toInterpolated } from '../../src/classes/Animateable'

const suite = createSuite('toInterpolated (node)')

suite('interpolates numbers', context => {
  const value = toInterpolated({ previous: 0, next: 100, progress: .42 }),
        expected = 42

  assert.is(value, expected)
})

suite('interpolates strings as colors', context => {
  const value = toInterpolated({ previous: 'white', next: '#000', progress: .5 }),
        expected = '#808080ff'

  assert.is(value, expected)
})

suite('interpolates growing arrays', context => {
  const value = toInterpolated({ previous: Array(0).fill(undefined), next: Array(100).fill(undefined), progress: .42 }),
        expected = Array(42).fill(undefined)

  assert.equal(value, expected)
})

suite('interpolates shrinking arrays', context => {
  const value = toInterpolated({ previous: Array(100).fill(undefined), next: Array(0).fill(undefined), progress: .42 }),
        expected = Array(100 - 42).fill(undefined)

  assert.equal(value, expected)
})

suite.run()
