import test from 'ava'
import toInterpolated from '../../src/util/toInterpolated'

test('interpolates numbers', t => {
  const value = toInterpolated({ previous: 0, next: 100, progress: .42 }),
        expected = 42

  t.is(value, expected)
})

test('interpolates strings as colors', t => {
  const value = toInterpolated({ previous: 'white', next: '#000', progress: .5 }),
        expected = '#808080ff'

  t.is(value, expected)
})

test('interpolates growing arrays', t => {
  const value = toInterpolated({ previous: Array(0).fill(), next: Array(100).fill(), progress: .42 }),
        expected = Array(42).fill()

  t.deepEqual(value, expected)
})

test('interpolates shrinking arrays', t => {
  const value = toInterpolated({ previous: Array(100).fill(), next: Array(0).fill(), progress: .42 }),
        expected = Array(100 - 42).fill()

  t.deepEqual(value, expected)
})
